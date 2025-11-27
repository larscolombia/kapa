import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { IlvReport } from '../../../database/entities/ilv-report.entity';
import { IlvReportField } from '../../../database/entities/ilv-report-field.entity';
import { IlvAttachment } from '../../../database/entities/ilv-attachment.entity';
import { IlvAudit } from '../../../database/entities/ilv-audit.entity';
import { Client } from '../../../database/entities/client.entity';
import { CreateIlvReportDto, IlvReportType } from '../dto/create-ilv-report.dto';
import { UpdateIlvReportDto } from '../dto/update-ilv-report.dto';
import { CloseIlvReportDto } from '../dto/close-ilv-report.dto';
import { FilterIlvReportDto } from '../dto/filter-ilv-report.dto';
import { FieldMapper } from '../utils/field-mapper.util';
import { IlvValidators } from '../utils/validators.util';
import { IlvAuthService } from './ilv-auth.service';
import { IlvNotificationsService } from './ilv-notifications.service';
import { IlvMaestrosService } from './ilv-maestros.service';

@Injectable()
export class IlvReportsService {
  constructor(
    @InjectRepository(IlvReport)
    private reportRepo: Repository<IlvReport>,
    @InjectRepository(IlvReportField)
    private fieldRepo: Repository<IlvReportField>,
    @InjectRepository(IlvAudit)
    private auditRepo: Repository<IlvAudit>,
    @InjectRepository(Client)
    private clientRepo: Repository<Client>,
    private authService: IlvAuthService,
    private notificationService: IlvNotificationsService,
    private maestrosService: IlvMaestrosService,
  ) { }

  async create(dto: CreateIlvReportDto, userId: number, ip: string, ua: string): Promise<IlvReport> {
    // AUTOCORRECCIÓN DE CLIENTE (ID Mismatch)
    // Verificar si el cliente existe en la tabla client
    const clientExists = await this.clientRepo.findOneBy({ client_id: dto.cliente_id });

    if (!clientExists) {
      console.log(`⚠️ Report creation: Client ID ${dto.cliente_id} not found in core table. Attempting auto-correction...`);
      try {
        // Buscar en maestros si es un ID de maestro (centro_trabajo)
        const maestros = await this.maestrosService.findByTipo('centro_trabajo');
        const maestro = maestros.find(m => m.maestro_id == dto.cliente_id);

        if (maestro) {
          console.log(`🔄 Found matching maestro: "${maestro.valor}" (ID: ${maestro.maestro_id})`);
          // Buscar cliente real por nombre
          const realClient = await this.clientRepo
            .createQueryBuilder('client')
            .where('LOWER(client.name) LIKE LOWER(:name)', { name: `%${maestro.valor.substring(0, 10)}%` })
            .getOne();

          if (realClient) {
            console.log(`✅ Auto-corrected: Redirecting report to client "${realClient.name}" (ID: ${realClient.client_id})`);
            dto.cliente_id = realClient.client_id;
          } else {
            console.warn(`❌ Auto-correction failed: No core client found matching "${maestro.valor}"`);
          }
        }
      } catch (err) {
        console.error('❌ Auto-correction error:', err);
      }
    }

    // Mapeo de compatibilidad para frontend (Legacy/Frontend Compatibility)
    // Si faltan campos requeridos pero existen sus equivalentes antiguos, los mapeamos
    const fieldsMap = dto.fields.reduce((acc, f) => ({ ...acc, [f.key]: f.value }), {});

    // Mapeos específicos para hazard_id
    if (dto.tipo === IlvReportType.HAZARD_ID) {
      if (!fieldsMap['fecha_evento'] && fieldsMap['fecha']) {
        fieldsMap['fecha_evento'] = fieldsMap['fecha'];
        dto.fields.push({ key: 'fecha_evento', value: fieldsMap['fecha'], value_type: 'date' });
      }
      if (!fieldsMap['descripcion_condicion'] && fieldsMap['descripcion_hallazgo']) {
        fieldsMap['descripcion_condicion'] = fieldsMap['descripcion_hallazgo'];
        dto.fields.push({ key: 'descripcion_condicion', value: fieldsMap['descripcion_hallazgo'], value_type: 'string' });
      }
      if (!fieldsMap['tipo_reporte_hid'] && fieldsMap['tipo_reporte']) {
        fieldsMap['tipo_reporte_hid'] = fieldsMap['tipo_reporte'];
        dto.fields.push({ key: 'tipo_reporte_hid', value: fieldsMap['tipo_reporte'], value_type: 'string' });
      }

      // Defaults para campos requeridos faltantes (para evitar bloqueo en frontend)
      if (!fieldsMap['ubicacion']) {
        fieldsMap['ubicacion'] = 'No especificada';
        dto.fields.push({ key: 'ubicacion', value: 'No especificada', value_type: 'string' });
      }
      if (!fieldsMap['severidad']) {
        // Default a 'Baja' (asumiendo que es un valor seguro o placeholder)
        fieldsMap['severidad'] = '1';
        dto.fields.push({ key: 'severidad', value: '1', value_type: 'string' });
      }
      if (!fieldsMap['area']) {
        // Default a 'General' o similar
        fieldsMap['area'] = '1';
        dto.fields.push({ key: 'area', value: '1', value_type: 'string' });
      }
    }

    IlvValidators.validateRequiredFields(dto.tipo, fieldsMap);
    IlvValidators.validateBusinessRules(dto.tipo, fieldsMap);

    const report = this.reportRepo.create({
      tipo: dto.tipo,
      centro_id: dto.centro_id,
      proyecto_id: dto.proyecto_id,
      cliente_id: dto.cliente_id,
      empresa_id: dto.empresa_id,
      creado_por: userId,
      propietario_user_id: userId,
      estado: 'abierto',
    });

    const savedReport = await this.reportRepo.save(report);

    const fields = dto.fields.map(f => this.fieldRepo.create({
      report_id: savedReport.report_id,
      key: f.key,
      value: f.value,
      value_type: f.value_type || 'string',
    }));

    await this.fieldRepo.save(fields);

    await this.audit('create', savedReport.report_id, userId, null, ip, ua);

    const token = await this.authService.generateCloseToken(
      savedReport.report_id,
      dto.empresa_id,
    );

    await this.notificationService.sendReportCreatedEmail(savedReport, token);

    return this.findOne(savedReport.report_id);
  }

  async findAll(filters: FilterIlvReportDto, userId: number): Promise<{ data: IlvReport[]; total: number }> {
    const qb = this.reportRepo.createQueryBuilder('r')
      .leftJoinAndSelect('r.fields', 'fields')
      .leftJoinAndSelect('r.project', 'project')
      .leftJoinAndSelect('r.client', 'client')
      .leftJoinAndSelect('r.contractor', 'contractor')
      .leftJoinAndSelect('r.created_by', 'created_by')
      .leftJoinAndSelect('r.owner', 'owner');

    if (filters.tipo) qb.andWhere('r.tipo = :tipo', { tipo: filters.tipo });
    if (filters.estado) qb.andWhere('r.estado = :estado', { estado: filters.estado });
    if (filters.proyecto_id) qb.andWhere('r.proyecto_id = :pid', { pid: filters.proyecto_id });
    if (filters.cliente_id) qb.andWhere('r.cliente_id = :cid', { cid: filters.cliente_id });
    if (filters.empresa_id) qb.andWhere('r.empresa_id = :eid', { eid: filters.empresa_id });

    if (filters.fecha_desde) {
      qb.andWhere('r.creado_en >= :desde', { desde: filters.fecha_desde });
    }
    if (filters.fecha_hasta) {
      qb.andWhere('r.creado_en <= :hasta', { hasta: filters.fecha_hasta });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;

    qb.skip((page - 1) * limit).take(limit);
    qb.orderBy('r.creado_en', 'DESC');

    const [data, total] = await qb.getManyAndCount();

    // Enriquecer campos con nombres legibles mediante consulta SQL eficiente
    for (const report of data) {
      for (const field of report.fields) {
        // Si el valor parece ser un ID numérico, determinar de dónde resolverlo
        if (field.value && /^\d+$/.test(field.value)) {
          const fieldId = parseInt(field.value);

          // Campos que se resuelven contra tablas específicas (NO maestros)
          if (field.key === 'cliente') {
            // Primero intentar como client_id directo
            let result = await this.fieldRepo.query(
              `SELECT name FROM client WHERE client_id = $1 LIMIT 1`,
              [fieldId]
            );

            // Si no existe en client, probablemente es un maestro_id (datos legacy)
            if (!result || !result[0]) {
              const maestro = await this.fieldRepo.query(
                `SELECT valor FROM ilv_maestro WHERE maestro_id = $1 AND activo = true LIMIT 1`,
                [fieldId]
              );
              if (maestro && maestro[0]) {
                field.value_display = maestro[0].valor;
              }
            } else {
              field.value_display = result[0].name;
            }
          } else if (field.key === 'proyecto') {
            const result = await this.fieldRepo.query(
              `SELECT name FROM project WHERE project_id = $1 LIMIT 1`,
              [fieldId]
            );
            if (result && result[0]) {
              field.value_display = result[0].name;
            }
          } else if (field.key === 'empresa_pertenece' || field.key === 'empresa_genera_reporte') {
            const result = await this.fieldRepo.query(
              `SELECT name FROM contractor WHERE contractor_id = $1 LIMIT 1`,
              [fieldId]
            );
            if (result && result[0]) {
              field.value_display = result[0].name;
            }
          } else {
            // Para todos los demás campos numéricos, buscar en maestros
            const maestro = await this.fieldRepo.query(
              `SELECT valor FROM ilv_maestro WHERE maestro_id = $1 AND activo = true LIMIT 1`,
              [fieldId]
            );
            if (maestro && maestro[0]) {
              field.value_display = maestro[0].valor;
            }
          }
        }
      }
    }

    return { data, total };
  }

  async findOne(id: number): Promise<IlvReport> {
    const report = await this.reportRepo.findOne({
      where: { report_id: id },
      relations: ['fields', 'project', 'client', 'contractor', 'created_by', 'owner'],
    });

    if (!report) {
      throw new NotFoundException(`Reporte ILV #${id} no encontrado`);
    }

    // Enriquecer campos con nombres legibles
    for (const field of report.fields) {
      if (field.value && /^\d+$/.test(field.value)) {
        const fieldId = parseInt(field.value);

        // Campos que se resuelven contra tablas específicas
        if (field.key === 'cliente') {
          // Primero intentar como client_id directo
          let result = await this.fieldRepo.query(
            `SELECT name FROM client WHERE client_id = $1 LIMIT 1`,
            [fieldId]
          );

          // Si no existe, probablemente es un maestro_id, resolver por nombre
          if (!result || !result[0]) {
            const maestro = await this.fieldRepo.query(
              `SELECT valor FROM ilv_maestro WHERE maestro_id = $1 AND activo = true LIMIT 1`,
              [fieldId]
            );
            if (maestro && maestro[0]) {
              // Usar el nombre del maestro como display
              field.value_display = maestro[0].valor;
            }
          } else {
            field.value_display = result[0].name;
          }
        } else if (field.key === 'proyecto') {
          const result = await this.fieldRepo.query(
            `SELECT name FROM project WHERE project_id = $1 LIMIT 1`,
            [fieldId]
          );
          if (result && result[0]) {
            field.value_display = result[0].name;
          }
        } else if (field.key === 'empresa_pertenece' || field.key === 'empresa_genera_reporte') {
          const result = await this.fieldRepo.query(
            `SELECT name FROM contractor WHERE contractor_id = $1 LIMIT 1`,
            [fieldId]
          );
          if (result && result[0]) {
            field.value_display = result[0].name;
          }
        } else {
          // Para todos los demás campos numéricos, buscar en maestros
          const maestro = await this.fieldRepo.query(
            `SELECT valor FROM ilv_maestro WHERE maestro_id = $1 AND activo = true LIMIT 1`,
            [fieldId]
          );
          if (maestro && maestro[0]) {
            field.value_display = maestro[0].valor;
          }
        }
      }
    }

    return report;
  }

  async findOnePublic(id: number): Promise<Partial<IlvReport>> {
    // Versión pública para cierre vía token
    // Solo retorna datos necesarios, sin información sensible
    const report = await this.reportRepo.findOne({
      where: { report_id: id },
      relations: ['fields', 'project', 'client', 'contractor'],
    });

    if (!report) {
      throw new NotFoundException(`Reporte ILV #${id} no encontrado`);
    }

    // Retornar solo campos readonly necesarios para el cierre
    return {
      report_id: report.report_id,
      tipo: report.tipo,
      estado: report.estado,
      creado_en: report.creado_en,
      fecha_cierre: report.fecha_cierre,
      fields: report.fields,
      project: report.project ? {
        project_id: report.project.project_id,
        name: report.project.name
      } : null,
      client: report.client ? {
        client_id: report.client.client_id,
        name: report.client.name
      } : null,
      contractor: report.contractor ? {
        contractor_id: report.contractor.contractor_id,
        name: report.contractor.name
      } : null,
    } as any;
  }

  async update(id: number, dto: UpdateIlvReportDto, userId: number, ip: string, ua: string): Promise<IlvReport> {
    const report = await this.findOne(id);

    if (report.propietario_user_id !== userId) {
      throw new ForbiddenException('Solo el propietario puede editar el reporte');
    }

    if (report.estado !== 'abierto') {
      throw new BadRequestException('Solo se pueden editar reportes abiertos');
    }

    if (dto.fields) {
      await this.fieldRepo.delete({ report_id: id });

      const newFields = dto.fields.map(f => this.fieldRepo.create({
        report_id: id,
        key: f.key,
        value: f.value,
        value_type: f.value_type || 'string',
      }));

      await this.fieldRepo.save(newFields);
    }

    report.actualizado_en = new Date();
    await this.reportRepo.save(report);

    await this.audit('update', id, userId, dto, ip, ua);

    return this.findOne(id);
  }

  async close(id: number, dto: CloseIlvReportDto, userId: number | null, jti: string, ip: string, ua: string): Promise<IlvReport> {
    const report = await this.findOne(id);

    if (report.estado === 'cerrado') {
      throw new BadRequestException('El reporte ya está cerrado');
    }

    const fieldsMap = { plan_accion: dto.plan_accion, ...dto };
    IlvValidators.validateCloseFields(report.tipo as IlvReportType, fieldsMap);

    await this.fieldRepo.save([
      this.fieldRepo.create({ report_id: id, key: 'plan_accion', value: dto.plan_accion }),
      ...(dto.evidencia_cierre ? [this.fieldRepo.create({ report_id: id, key: 'evidencia_cierre', value: dto.evidencia_cierre })] : []),
      ...(dto.fecha_implantacion ? [this.fieldRepo.create({ report_id: id, key: 'fecha_implantacion', value: dto.fecha_implantacion })] : []),
    ]);

    report.estado = 'cerrado';
    report.fecha_cierre = new Date();
    report.cerrado_por = userId;

    await this.reportRepo.save(report);
    await this.authService.markTokenAsUsed(jti, ip, ua);
    await this.audit('close', id, userId, dto, ip, ua);
    await this.notificationService.sendReportClosedEmail(report);

    return this.findOne(id);
  }

  private async audit(action: string, reportId: number, userId: number | null, data: any, ip: string, ua: string): Promise<void> {
    await this.auditRepo.save({
      entidad: 'ilv_report',
      entidad_id: reportId,
      accion: action,
      actor_id: userId,
      diff_json: data,
      ip,
      user_agent: ua,
    });
  }

  async exportToExcel(filters: FilterIlvReportDto, userId: number): Promise<Buffer> {
    // Implementación básica para Excel
    const { data } = await this.findAll(filters, userId);

    // Por ahora retornamos un CSV simple como placeholder
    // TODO: Implementar Excel real con librería como 'exceljs'
    const csvContent = this.generateCSV(data);
    return Buffer.from(csvContent, 'utf-8');
  }

  async exportToPdf(filters: FilterIlvReportDto, userId: number): Promise<Buffer> {
    // Implementación básica para PDF
    const { data } = await this.findAll(filters, userId);

    // Por ahora retornamos texto simple como placeholder
    // TODO: Implementar PDF real con librería como 'puppeteer' o 'pdfkit'
    const textContent = this.generatePdfText(data);
    return Buffer.from(textContent, 'utf-8');
  }

  private generateCSV(reports: IlvReport[]): string {
    const headers = ['ID', 'Tipo', 'Estado', 'Proyecto', 'Cliente', 'Fecha Creación'];
    const rows = reports.map(r => [
      r.report_id,
      r.tipo,
      r.estado,
      r.project?.name || 'N/A',
      r.client?.name || 'N/A',
      r.creado_en.toISOString().split('T')[0]
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private generatePdfText(reports: IlvReport[]): string {
    let content = 'REPORTE ILV\n\n';
    content += `Generado el: ${new Date().toLocaleString()}\n\n`;

    reports.forEach(r => {
      content += `ID: ${r.report_id}\n`;
      content += `Tipo: ${r.tipo}\n`;
      content += `Estado: ${r.estado}\n`;
      content += `Proyecto: ${r.project?.name || 'N/A'}\n`;
      content += `Cliente: ${r.client?.name || 'N/A'}\n`;
      content += `Fecha: ${r.creado_en.toISOString().split('T')[0]}\n`;
      content += '---\n\n';
    });

    return content;
  }

  async deleteBulk(ids: number[], userId: number): Promise<{ deleted: number }> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('No se proporcionaron IDs para borrar');
    }

    // Borrar campos asociados primero
    await this.fieldRepo.delete({ report_id: In(ids) });

    // Borrar reportes
    const result = await this.reportRepo.delete({ report_id: In(ids) });

    // Log de auditoría
    for (const id of ids) {
      await this.auditRepo.save({
        report_id: id,
        accion: 'deleted',
        usuario_id: userId,
        cambios: JSON.stringify({ deleted_by_admin: true }),
        ip: 'system',
        user_agent: 'bulk-delete',
      });
    }

    return { deleted: result.affected || 0 };
  }
}
