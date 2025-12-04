import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { InspeccionReport } from '../../../database/entities/inspeccion-report.entity';
import { InspeccionReportField } from '../../../database/entities/inspeccion-report-field.entity';
import { InspeccionMaestro } from '../../../database/entities/inspeccion-maestro.entity';
import { CreateInspeccionReportDto } from '../dto/create-inspeccion-report.dto';
import { UpdateInspeccionReportDto } from '../dto/update-inspeccion-report.dto';
import { FilterInspeccionDto } from '../dto/filter-inspeccion.dto';

/**
 * Parsea una fecha string (YYYY-MM-DD) a Date sin problemas de timezone.
 * Añade la hora al mediodía para evitar que cambie de día por timezone.
 */
function parseDateSafe(dateStr: string | Date): Date | null {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  
  // Si es string en formato YYYY-MM-DD, parsearlo manualmente
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    // Crear fecha a las 12:00 mediodía para evitar cambios por timezone
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
  }
  
  // Fallback: intentar parsear como viene
  return new Date(dateStr);
}

@Injectable()
export class InspeccionesReportsService {
  constructor(
    @InjectRepository(InspeccionReport)
    private reportRepo: Repository<InspeccionReport>,
    @InjectRepository(InspeccionReportField)
    private fieldRepo: Repository<InspeccionReportField>,
    @InjectRepository(InspeccionMaestro)
    private maestroRepo: Repository<InspeccionMaestro>,
  ) {}

  /**
   * Crea un nuevo reporte de inspección
   * Restricciones de permisos:
   * - Inspección Técnica: Solo roles 1 (Admin), 2 (KAPA), 3 (Cliente)
   * - Auditoría Cruzada: Cualquier usuario autenticado
   */
  async create(dto: CreateInspeccionReportDto, userId: number, userRoleId: number): Promise<InspeccionReport> {
    // Validar permisos según tipo
    if (dto.tipo === 'tecnica') {
      const allowedRoles = [1, 2, 3]; // Admin, KAPA, Cliente
      if (!allowedRoles.includes(userRoleId)) {
        throw new ForbiddenException('Solo Admin, Usuario KAPA o Cliente pueden crear Inspecciones Técnicas');
      }
    }
    // Auditoría cruzada: cualquier usuario autenticado puede crear

    // Validar campos requeridos según tipo
    const fieldsMap = dto.fields.reduce((acc, f) => ({ ...acc, [f.key]: f.value }), {});

    if (dto.tipo === 'tecnica') {
      if (!fieldsMap['tipo_inspeccion_id']) {
        throw new BadRequestException('tipo_inspeccion_id es requerido para Inspección Técnica');
      }
      if (!fieldsMap['clasificacion_inspeccion_id']) {
        throw new BadRequestException('clasificacion_inspeccion_id es requerido para Inspección Técnica');
      }
    } else if (dto.tipo === 'auditoria') {
      if (!dto.empresa_auditada_id) {
        throw new BadRequestException('empresa_auditada_id es requerido para Auditoría Cruzada');
      }
      if (!fieldsMap['area_auditoria_id']) {
        throw new BadRequestException('area_auditoria_id es requerido para Auditoría Cruzada');
      }
    }

    // Crear el reporte
    const report = this.reportRepo.create({
      tipo: dto.tipo,
      fecha: parseDateSafe(dto.fecha),
      proyecto_id: dto.proyecto_id,
      cliente_id: dto.cliente_id,
      empresa_id: dto.empresa_id,
      empresa_auditada_id: dto.empresa_auditada_id,
      observacion: dto.observacion,
      creado_por: userId,
      propietario_user_id: userId,
      estado: dto.estado || 'abierto',
    });

    const savedReport = await this.reportRepo.save(report);

    // Guardar campos dinámicos
    const fields = dto.fields.map(f => this.fieldRepo.create({
      report_id: savedReport.report_id,
      key: f.key,
      value: f.value,
      value_type: f.value_type || 'string',
    }));

    await this.fieldRepo.save(fields);

    return this.findOne(savedReport.report_id);
  }

  /**
   * Busca reportes con filtros y paginación
   */
  async findAll(filters: FilterInspeccionDto, userId: number): Promise<{ data: InspeccionReport[]; total: number }> {
    const qb = this.reportRepo.createQueryBuilder('r')
      .leftJoinAndSelect('r.fields', 'fields')
      .leftJoinAndSelect('r.project', 'project')
      .leftJoinAndSelect('r.client', 'client')
      .leftJoinAndSelect('r.contractor', 'contractor')
      .leftJoinAndSelect('r.empresa_auditada', 'empresa_auditada')
      .leftJoinAndSelect('r.created_by', 'created_by')
      .leftJoinAndSelect('r.owner', 'owner');

    // Filtros principales
    if (filters.tipo) qb.andWhere('r.tipo = :tipo', { tipo: filters.tipo });
    if (filters.estado) qb.andWhere('r.estado = :estado', { estado: filters.estado });
    if (filters.proyecto_id) qb.andWhere('r.proyecto_id = :pid', { pid: filters.proyecto_id });
    if (filters.cliente_id) qb.andWhere('r.cliente_id = :cid', { cid: filters.cliente_id });
    if (filters.empresa_id) qb.andWhere('r.empresa_id = :eid', { eid: filters.empresa_id });
    if (filters.empresa_auditada_id) qb.andWhere('r.empresa_auditada_id = :eaid', { eaid: filters.empresa_auditada_id });

    // Filtros de fecha con tiempo completo
    if (filters.fecha_desde) {
      qb.andWhere('r.creado_en >= :desde', { desde: `${filters.fecha_desde} 00:00:00` });
    }
    if (filters.fecha_hasta) {
      qb.andWhere('r.creado_en <= :hasta', { hasta: `${filters.fecha_hasta} 23:59:59` });
    }

    // Búsqueda en campos
    if (filters.search) {
      qb.andWhere(
        `EXISTS (SELECT 1 FROM inspeccion_report_field f WHERE f.report_id = r.report_id AND f.value ILIKE :search)`,
        { search: `%${filters.search}%` }
      );
    }

    // Paginación
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    qb.skip((page - 1) * limit).take(limit);
    qb.orderBy('r.creado_en', 'DESC');

    const [data, total] = await qb.getManyAndCount();

    // Enriquecer campos con nombres legibles desde maestros
    for (const report of data) {
      await this.enrichFieldsWithDisplayValues(report.fields);
    }

    // Convertir a objetos planos para asegurar serialización de value_display
    const enrichedData = data.map(report => ({
      ...report,
      fields: report.fields.map(f => ({
        field_id: f.field_id,
        report_id: f.report_id,
        key: f.key,
        value: f.value,
        value_type: f.value_type,
        value_display: f.value_display || f.value,
      })),
    }));

    return { data: enrichedData as any, total };
  }

  /**
   * Obtener un reporte por ID
   */
  async findOne(id: number): Promise<any> {
    const report = await this.reportRepo.findOne({
      where: { report_id: id },
      relations: ['fields', 'project', 'client', 'contractor', 'empresa_auditada', 'created_by', 'owner'],
    });

    if (!report) {
      throw new NotFoundException(`Reporte de Inspección #${id} no encontrado`);
    }

    await this.enrichFieldsWithDisplayValues(report.fields);

    // Convertir explícitamente a objeto plano para asegurar que value_display se serialice
    const result = {
      ...report,
      fields: report.fields.map(f => ({
        field_id: f.field_id,
        report_id: f.report_id,
        key: f.key,
        value: f.value,
        value_type: f.value_type,
        value_display: f.value_display || f.value,
      })),
    };

    return result;
  }

  /**
   * Actualizar un reporte existente
   */
  async update(id: number, dto: UpdateInspeccionReportDto, userId: number, userRoleId: number): Promise<InspeccionReport> {
    const report = await this.reportRepo.findOne({
      where: { report_id: id },
    });

    if (!report) {
      throw new NotFoundException(`Reporte de Inspección #${id} no encontrado`);
    }

    const isAdmin = userRoleId === 1;

    // Verificar permisos de edición
    if (report.propietario_user_id !== userId && !isAdmin) {
      throw new ForbiddenException('Solo el propietario o un administrador puede editar el reporte');
    }

    // Solo admins pueden editar reportes cerrados
    if (report.estado === 'cerrado' && !isAdmin) {
      throw new BadRequestException('Solo administradores pueden editar reportes cerrados');
    }

    // Actualizar campos opcionales
    if (dto.fecha) {
      report.fecha = parseDateSafe(dto.fecha);
    }

    if (dto.observacion !== undefined) {
      // Guardar observación como campo
      await this.fieldRepo.delete({ report_id: id, key: 'observacion' });
      await this.fieldRepo.save(this.fieldRepo.create({
        report_id: id,
        key: 'observacion',
        value: dto.observacion,
        value_type: 'string',
      }));
    }

    // Actualizar estado
    if (dto.estado) {
      report.estado = dto.estado;
      if (dto.estado === 'cerrado') {
        report.fecha_cierre = new Date();
      } else {
        report.fecha_cierre = null;
      }
    }

    // Actualizar campos dinámicos
    if (dto.fields && dto.fields.length > 0) {
      await this.fieldRepo.delete({ report_id: id });

      for (const f of dto.fields) {
        const field = new InspeccionReportField();
        field.report_id = id;
        field.key = f.key;
        field.value = f.value;
        field.value_type = f.value_type || 'string';
        await this.fieldRepo.save(field);
      }
    }

    report.actualizado_en = new Date();
    await this.reportRepo.save(report);

    return this.findOne(id);
  }

  /**
   * Eliminar múltiples reportes (solo admin)
   */
  async deleteBulk(ids: number[], userId: number, userRoleId: number): Promise<{ deleted: number }> {
    if (userRoleId !== 1) {
      throw new ForbiddenException('Solo administradores pueden eliminar reportes');
    }

    if (!ids || ids.length === 0) {
      throw new BadRequestException('No se proporcionaron IDs para borrar');
    }

    // Borrar campos asociados primero
    await this.fieldRepo.delete({ report_id: In(ids) });

    // Borrar reportes
    const result = await this.reportRepo.delete({ report_id: In(ids) });

    return { deleted: result.affected || 0 };
  }

  /**
   * Obtener maestros por tipo
   */
  async getMaestros(tipo: string, padreId?: number): Promise<InspeccionMaestro[]> {
    const qb = this.maestroRepo.createQueryBuilder('m')
      .where('m.tipo = :tipo', { tipo })
      .andWhere('m.activo = true')
      .orderBy('m.orden', 'ASC');

    if (padreId !== undefined) {
      qb.andWhere('m.padre_id = :padreId', { padreId });
    }

    return qb.getMany();
  }

  /**
   * Obtener tipos de inspección técnica
   */
  async getTiposInspeccionTecnica(): Promise<InspeccionMaestro[]> {
    return this.getMaestros('tipo_inspeccion_tecnica');
  }

  /**
   * Obtener clasificaciones por tipo de inspección
   */
  async getClasificacionesByTipo(tipoId: number): Promise<InspeccionMaestro[]> {
    return this.getMaestros('clasificacion_inspeccion', tipoId);
  }

  /**
   * Obtener áreas de auditoría
   */
  async getAreasAuditoria(): Promise<InspeccionMaestro[]> {
    return this.getMaestros('area_auditoria');
  }

  /**
   * Obtener clasificaciones de auditoría cruzada
   */
  async getClasificacionesAuditoria(): Promise<InspeccionMaestro[]> {
    return this.getMaestros('clasificacion_auditoria');
  }

  /**
   * Obtener estados de reporte
   */
  async getEstados(): Promise<InspeccionMaestro[]> {
    return this.getMaestros('estado_reporte');
  }

  /**
   * Obtener áreas de inspección técnica
   */
  async getAreasInspeccion(): Promise<InspeccionMaestro[]> {
    return this.getMaestros('area_inspeccion');
  }

  /**
   * Obtener usuarios (Kapa y clientes) para "Quien reporta"
   */
  async getUsuarios(): Promise<any[]> {
    return this.maestroRepo.query(
      `SELECT user_id, name, email FROM "user" WHERE state = 'active' ORDER BY name`
    );
  }

  /**
   * Enriquecer campos con valores display desde maestros
   */
  private async enrichFieldsWithDisplayValues(fields: InspeccionReportField[]): Promise<void> {
    for (const field of fields) {
      // Si el valor es un número, intentar obtener el valor display
      if (field.value && /^\d+$/.test(field.value)) {
        const fieldId = parseInt(field.value);

        // Buscar en maestros de inspección
        const maestro = await this.maestroRepo.findOne({
          where: { maestro_id: fieldId, activo: true }
        });
        
        if (maestro) {
          field.value_display = maestro.valor;
        } else {
          // Fallback: buscar en tablas core según el key
          if (field.key === 'cliente' || field.key === 'cliente_id') {
            const result = await this.fieldRepo.query(
              `SELECT name FROM client WHERE client_id = $1 LIMIT 1`,
              [fieldId]
            );
            if (result && result[0]) {
              field.value_display = result[0].name;
            }
          } else if (field.key === 'proyecto' || field.key === 'proyecto_id') {
            const result = await this.fieldRepo.query(
              `SELECT name FROM project WHERE project_id = $1 LIMIT 1`,
              [fieldId]
            );
            if (result && result[0]) {
              field.value_display = result[0].name;
            }
          } else if (field.key === 'quien_reporta_id' || field.key === 'quien_reporta') {
            // Buscar en tabla user
            const result = await this.fieldRepo.query(
              `SELECT name FROM "user" WHERE user_id = $1 LIMIT 1`,
              [fieldId]
            );
            if (result && result[0]) {
              field.value_display = result[0].name;
            }
          } else if (field.key.includes('empresa')) {
            const result = await this.fieldRepo.query(
              `SELECT name FROM contractor WHERE contractor_id = $1 LIMIT 1`,
              [fieldId]
            );
            if (result && result[0]) {
              field.value_display = result[0].name;
            }
          }
        }
      } else if (field.value) {
        // Si no es un número, el value_display es el mismo valor
        field.value_display = field.value;
      }
    }
  }

  /**
   * Exportar a Excel
   */
  async exportToExcel(filters: FilterInspeccionDto, userId: number): Promise<Buffer> {
    const { data } = await this.findAll(filters, userId);
    const csvContent = this.generateCSV(data);
    return Buffer.from(csvContent, 'utf-8');
  }

  /**
   * Exportar a PDF
   */
  async exportToPdf(filters: FilterInspeccionDto, userId: number): Promise<Buffer> {
    const { data } = await this.findAll(filters, userId);
    const textContent = this.generatePdfText(data);
    return Buffer.from(textContent, 'utf-8');
  }

  private generateCSV(reports: InspeccionReport[]): string {
    const headers = ['ID', 'Tipo', 'Estado', 'Proyecto', 'Cliente', 'Fecha Creación'];
    const rows = reports.map(r => [
      r.report_id,
      r.tipo === 'tecnica' ? 'Inspección Técnica' : 'Auditoría Cruzada',
      r.estado,
      r.project?.name || 'N/A',
      r.client?.name || 'N/A',
      r.creado_en.toISOString().split('T')[0]
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private generatePdfText(reports: InspeccionReport[]): string {
    let content = 'REPORTE DE INSPECCIONES\n\n';
    content += `Generado el: ${new Date().toLocaleString()}\n\n`;

    reports.forEach(r => {
      content += `ID: ${r.report_id}\n`;
      content += `Tipo: ${r.tipo === 'tecnica' ? 'Inspección Técnica' : 'Auditoría Cruzada'}\n`;
      content += `Estado: ${r.estado}\n`;
      content += `Proyecto: ${r.project?.name || 'N/A'}\n`;
      content += `Cliente: ${r.client?.name || 'N/A'}\n`;
      content += `Fecha: ${r.creado_en.toISOString().split('T')[0]}\n`;
      content += '---\n\n';
    });

    return content;
  }
}
