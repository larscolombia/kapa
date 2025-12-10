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
import { ExportService, PdfReportData, PdfSection } from '../../../common/services/export.service';

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

    // Determinar estado inicial basado en el campo 'estado' si existe
    let estadoInicial = 'abierto';
    const estadoField = dto.fields.find(f => f.key === 'estado');
    if (estadoField && estadoField.value) {
      const maestroResult = await this.fieldRepo.query(
        `SELECT LOWER(valor) as valor FROM ilv_maestro WHERE maestro_id = $1 AND activo = true LIMIT 1`,
        [parseInt(estadoField.value)]
      );
      if (maestroResult && maestroResult[0] && maestroResult[0].valor === 'cerrado') {
        estadoInicial = 'cerrado';
      }
    }

    const report = this.reportRepo.create({
      tipo: dto.tipo,
      centro_id: dto.centro_id,
      proyecto_id: dto.proyecto_id,
      cliente_id: dto.cliente_id,
      empresa_id: dto.empresa_id,
      creado_por: userId,
      propietario_user_id: userId,
      estado: estadoInicial,
      fecha_cierre: estadoInicial === 'cerrado' ? new Date() : null,
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

    // Filtros por campos dinámicos (categoría, subcategoría, responsable)
    if (filters.categoria_id) {
      qb.andWhere(`EXISTS (
        SELECT 1 FROM ilv_report_field f 
        WHERE f.report_id = r.report_id 
        AND f.key = 'categoria' 
        AND f.value = :catId
      )`, { catId: filters.categoria_id.toString() });
    }

    if (filters.subcategoria_id) {
      qb.andWhere(`EXISTS (
        SELECT 1 FROM ilv_report_field f 
        WHERE f.report_id = r.report_id 
        AND f.key = 'subcategoria' 
        AND f.value = :subcatId
      )`, { subcatId: filters.subcategoria_id.toString() });
    }

    if (filters.responsable_id) {
      qb.andWhere(`EXISTS (
        SELECT 1 FROM ilv_report_field f 
        WHERE f.report_id = r.report_id 
        AND f.key IN ('nombre_quien_reporta', 'nombre_ehs_contratista', 'nombre_supervisor_obra')
        AND f.value = :respId
      )`, { respId: filters.responsable_id.toString() });
    }

    if (filters.fecha_desde) {
      // Agregar hora 00:00:00 para incluir todo el día desde el inicio
      qb.andWhere('r.creado_en >= :desde', { desde: `${filters.fecha_desde} 00:00:00` });
    }
    if (filters.fecha_hasta) {
      // Agregar hora 23:59:59 para incluir todo el día hasta el final
      qb.andWhere('r.creado_en <= :hasta', { hasta: `${filters.fecha_hasta} 23:59:59` });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const sortBy = filters.sortBy || 'creado_en';
    const order = (filters.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC') as 'ASC' | 'DESC';

    // Map frontend column names to database fields
    const sortFieldMap: Record<string, string> = {
      'report_id': 'r.report_id',
      'tipo': 'r.tipo',
      'estado': 'r.estado',
      'creado_en': 'r.creado_en',
      'proyecto': 'project.name',
      'cliente': 'client.name',
      'empresa': 'contractor.name'
    };

    const sortField = sortFieldMap[sortBy] || 'r.creado_en';

    qb.skip((page - 1) * limit).take(limit);
    qb.orderBy(sortField, order);

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
    // Buscar el reporte SIN enriquecer para evitar problemas de cascada
    const report = await this.reportRepo.findOne({
      where: { report_id: id },
    });

    if (!report) {
      throw new NotFoundException(`Reporte ILV #${id} no encontrado`);
    }

    // Verificar si es admin
    const user = await this.reportRepo.query(
      `SELECT role_id FROM "user" WHERE user_id = $1`,
      [userId]
    );
    const isAdmin = user && user[0] && user[0].role_id === 1;

    // Verificar permisos de edición
    if (report.propietario_user_id !== userId && !isAdmin) {
      throw new ForbiddenException('Solo el propietario o un administrador puede editar el reporte');
    }

    // Solo admins pueden editar reportes cerrados
    if (report.estado !== 'abierto' && !isAdmin) {
      throw new BadRequestException('Solo se pueden editar reportes abiertos');
    }

    if (dto.fields && dto.fields.length > 0) {
      // Eliminar campos anteriores
      await this.fieldRepo.delete({ report_id: id });

      // Crear nuevos campos uno por uno para asegurar el report_id
      for (const f of dto.fields) {
        const field = new IlvReportField();
        field.report_id = id;
        field.key = f.key;
        field.value = f.value;
        field.value_type = f.value_type || 'string';
        await this.fieldRepo.save(field);
      }

      // Sincronizar el estado si viene en los fields
      const estadoField = dto.fields.find(f => f.key === 'estado');
      if (estadoField && estadoField.value) {
        // Buscar el valor del maestro para determinar si es "cerrado"
        const maestroResult = await this.fieldRepo.query(
          `SELECT LOWER(valor) as valor FROM ilv_maestro WHERE maestro_id = $1 AND activo = true LIMIT 1`,
          [parseInt(estadoField.value)]
        );
        if (maestroResult && maestroResult[0]) {
          const estadoValor = maestroResult[0].valor;
          if (estadoValor === 'cerrado') {
            report.estado = 'cerrado';
            report.fecha_cierre = new Date();
          } else if (estadoValor === 'abierto') {
            report.estado = 'abierto';
            report.fecha_cierre = null;
          }
        }
      }
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

  /**
   * Exportar listado de reportes ILV a Excel
   */
  async exportToExcel(filters: FilterIlvReportDto, userId: number): Promise<Buffer> {
    const { data } = await this.findAll(filters, userId);

    // SLA en horas (configurable)
    const SLA_HOURS = 72; // 3 días para cerrar un reporte

    const columns = [
      { header: 'ID', key: 'report_id', width: 8 },
      { header: 'Tipo', key: 'tipo_label', width: 20 },
      { header: 'Estado', key: 'estado', width: 12 },
      { header: 'Centro de Trabajo', key: 'cliente', width: 25 },
      { header: 'Proyecto', key: 'proyecto', width: 25 },
      { header: 'Empresa/Contratista', key: 'empresa', width: 25 },
      { header: 'Área', key: 'area', width: 20 },
      { header: 'Categoría', key: 'categoria', width: 20 },
      { header: 'Subcategoría', key: 'subcategoria', width: 20 },
      { header: 'Descripción', key: 'descripcion', width: 40 },
      { header: 'Creado Por', key: 'creador', width: 20 },
      { header: 'Fecha Creación', key: 'fecha_creacion', width: 15 },
      { header: 'Fecha Cierre', key: 'fecha_cierre', width: 15 },
      { header: 'Tiempo Resolución (hrs)', key: 'tiempo_resolucion', width: 18 },
      { header: 'Cumplimiento SLA', key: 'cumplimiento_sla', width: 15 },
    ];

    const tipoLabels: Record<string, string> = {
      'hazard_id': 'Identificación de Peligros',
      'wit': 'Walk & Talk',
      'swa': 'Stop Work Authority',
      'fdkar': 'Safety Cards'
    };

    // Función para obtener valor de campo dinámico
    const getFieldValue = (report: any, key: string): string => {
      const field = report.fields?.find(f => f.key === key);
      return field?.value_display || field?.value || 'N/A';
    };

    // Calcular tiempo de resolución en horas
    const calcResolutionTime = (creado: Date, cierre: Date | null): number | null => {
      if (!cierre) return null;
      const diffMs = new Date(cierre).getTime() - new Date(creado).getTime();
      return Math.round(diffMs / (1000 * 60 * 60) * 10) / 10; // Redondear a 1 decimal
    };

    const excelData = data.map(r => {
      const tiempoResolucion = calcResolutionTime(r.creado_en, r.fecha_cierre);
      return {
        report_id: r.report_id,
        tipo_label: tipoLabels[r.tipo] || r.tipo,
        estado: r.estado === 'abierto' ? 'Abierto' : 'Cerrado',
        cliente: r.client?.name || 'N/A',
        proyecto: r.project?.name || 'N/A',
        empresa: r.contractor?.name || 'N/A',
        area: getFieldValue(r, 'area'),
        categoria: getFieldValue(r, 'categoria'),
        subcategoria: getFieldValue(r, 'subcategoria'),
        descripcion: getFieldValue(r, 'descripcion_condicion') || getFieldValue(r, 'descripcion_hallazgo'),
        creador: r.created_by?.name || 'N/A',
        fecha_creacion: r.creado_en ? new Date(r.creado_en).toLocaleDateString('es-CO') : 'N/A',
        fecha_cierre: r.fecha_cierre ? new Date(r.fecha_cierre).toLocaleDateString('es-CO') : 'N/A',
        tiempo_resolucion: tiempoResolucion !== null ? tiempoResolucion : 'Pendiente',
        cumplimiento_sla: r.estado === 'cerrado' 
          ? (tiempoResolucion !== null && tiempoResolucion <= SLA_HOURS ? 'Cumple' : 'No Cumple')
          : 'Pendiente',
      };
    });

    let subtitle = 'Todos los reportes';
    if (filters.tipo) subtitle = `Tipo: ${tipoLabels[filters.tipo] || filters.tipo}`;
    if (filters.estado) subtitle += ` | Estado: ${filters.estado}`;
    if (filters.fecha_desde || filters.fecha_hasta) {
      subtitle += ` | Período: ${filters.fecha_desde || '*'} - ${filters.fecha_hasta || '*'}`;
    }

    return ExportService.generateExcel({
      title: 'Reportes ILV - KAPA',
      subtitle,
      columns,
      data: excelData,
      sheetName: 'Reportes ILV'
    });
  }

  /**
   * Exportar un reporte ILV individual a PDF
   */
  async exportToPdf(reportId: number): Promise<Buffer> {
    const report = await this.findOne(reportId);

    const tipoLabels: Record<string, string> = {
      'hazard_id': 'Identificación de Peligros (HID)',
      'wit': 'Walk & Talk (W&T)',
      'swa': 'Stop Work Authority (SWA)',
      'fdkar': 'Safety Cards (FDKAR)'
    };

    const fieldLabels: Record<string, string> = {
      'fecha': 'Fecha',
      'fecha_evento': 'Fecha del Evento',
      'cliente': 'Centro de Trabajo',
      'proyecto': 'Proyecto',
      'empresa_pertenece': 'Empresa a la que pertenece',
      'empresa_genera_reporte': 'Empresa a quien se genera el reporte',
      'nombre_quien_reporta': 'Nombre de quien reporta',
      'tipo_reporte_hid': 'Tipo de Reporte',
      'categoria': 'Categoría',
      'subcategoria': 'Subcategoría',
      'ubicacion': 'Ubicación',
      'severidad': 'Severidad',
      'area': 'Área',
      'descripcion_condicion': 'Descripción de la Condición',
      'descripcion_hallazgo': 'Descripción del Hallazgo',
      'causa_probable': 'Causa Probable',
      'accion_inmediata': 'Acción Inmediata',
      'nombre_ehs_contratista': 'Nombre EHS del Contratista',
      'nombre_supervisor_obra': 'Nombre Supervisor de Obra',
      'conducta_observada': 'Conducta Observada',
      'recomendacion': 'Recomendación',
      'tipo': 'Tipo',
      'testigo': 'Testigo',
      'hora_inicio_parada': 'Hora Inicio de Parada',
      'hora_reinicio': 'Hora de Reinicio',
      'tipo_tarjeta': 'Tipo de Tarjeta',
      'observacion': 'Observación',
      'descripcion_cierre': 'Descripción de Cierre',
      'evidencia_cierre': 'Evidencia de Cierre',
      'fecha_implantacion': 'Fecha de Implantación',
      'estado': 'Estado'
    };

    // Información general del reporte
    const infoGeneral: PdfSection = {
      titulo: 'Información General',
      campos: [
        { label: 'ID del Reporte', value: report.report_id },
        { label: 'Tipo de Reporte', value: tipoLabels[report.tipo] || report.tipo },
        { label: 'Estado', value: report.estado === 'abierto' ? 'Abierto' : 'Cerrado' },
        { label: 'Centro de Trabajo', value: report.client?.name || 'N/A' },
        { label: 'Proyecto', value: report.project?.name || 'N/A' },
        { label: 'Empresa/Contratista', value: report.contractor?.name || 'N/A' },
        { label: 'Creado Por', value: report.created_by?.name || 'N/A' },
        { label: 'Fecha de Creación', value: report.creado_en ? new Date(report.creado_en).toLocaleString('es-CO') : 'N/A' },
      ]
    };

    // Calcular tiempo de resolución y cumplimiento SLA
    const SLA_HOURS = 72; // 3 días
    if (report.estado === 'cerrado' && report.fecha_cierre) {
      infoGeneral.campos.push({ label: 'Fecha de Cierre', value: new Date(report.fecha_cierre).toLocaleString('es-CO') });
      
      // Calcular tiempo de resolución
      const diffMs = new Date(report.fecha_cierre).getTime() - new Date(report.creado_en).getTime();
      const tiempoHoras = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10;
      const tiempoDias = Math.round(tiempoHoras / 24 * 10) / 10;
      infoGeneral.campos.push({ label: 'Tiempo de Resolución', value: `${tiempoHoras} horas (${tiempoDias} días)` });
      infoGeneral.campos.push({ label: 'Cumplimiento SLA', value: tiempoHoras <= SLA_HOURS ? '✅ Cumple (≤72h)' : '❌ No Cumple (>72h)' });
    }

    // Campos dinámicos del formulario
    const camposFormulario: PdfSection = {
      titulo: 'Detalles del Reporte',
      campos: []
    };

    for (const field of report.fields) {
      // Omitir campos que ya están en información general
      if (['cliente', 'proyecto', 'empresa_genera_reporte', 'empresa_pertenece'].includes(field.key)) {
        continue;
      }

      const label = fieldLabels[field.key] || field.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const value = field.value_display || field.value;

      camposFormulario.campos.push({ label, value });
    }

    const secciones: PdfSection[] = [infoGeneral];
    if (camposFormulario.campos.length > 0) {
      secciones.push(camposFormulario);
    }

    // Información de adjuntos si existen
    if (report.attachments && report.attachments.length > 0) {
      secciones.push({
        titulo: 'Archivos Adjuntos',
        campos: report.attachments.map((att, idx) => ({
          label: `Archivo ${idx + 1}`,
          value: att.filename
        }))
      });
    }

    const pdfData: PdfReportData = {
      titulo: `Reporte ILV #${report.report_id}`,
      subtitulo: tipoLabels[report.tipo] || report.tipo,
      fechaGeneracion: new Date(),
      secciones
    };

    return ExportService.generatePdf(pdfData);
  }

  /**
   * Exportar múltiples reportes a PDF (resumen)
   */
  async exportListToPdf(filters: FilterIlvReportDto, userId: number): Promise<Buffer> {
    const { data } = await this.findAll(filters, userId);

    const tipoLabels: Record<string, string> = {
      'hazard_id': 'Identificación de Peligros',
      'wit': 'Walk & Talk',
      'swa': 'Stop Work Authority',
      'fdkar': 'Safety Cards'
    };

    // Estadísticas
    const stats = {
      total: data.length,
      abiertos: data.filter(r => r.estado === 'abierto').length,
      cerrados: data.filter(r => r.estado === 'cerrado').length,
      porTipo: {} as Record<string, number>
    };
    
    data.forEach(r => {
      stats.porTipo[r.tipo] = (stats.porTipo[r.tipo] || 0) + 1;
    });

    const secciones: PdfSection[] = [
      {
        titulo: 'Resumen',
        campos: [
          { label: 'Total de Reportes', value: stats.total },
          { label: 'Reportes Abiertos', value: stats.abiertos },
          { label: 'Reportes Cerrados', value: stats.cerrados },
        ]
      },
      {
        titulo: 'Distribución por Tipo',
        campos: Object.entries(stats.porTipo).map(([tipo, count]) => ({
          label: tipoLabels[tipo] || tipo,
          value: count
        }))
      },
      {
        titulo: 'Listado de Reportes',
        campos: [],
        tabla: {
          headers: ['ID', 'Tipo', 'Estado', 'Cliente', 'Proyecto', 'Fecha'],
          rows: data.slice(0, 50).map(r => [ // Limitar a 50 para el PDF
            r.report_id,
            tipoLabels[r.tipo] || r.tipo,
            r.estado === 'abierto' ? 'Abierto' : 'Cerrado',
            r.client?.name || 'N/A',
            r.project?.name || 'N/A',
            r.creado_en ? new Date(r.creado_en).toLocaleDateString('es-CO') : 'N/A'
          ])
        }
      }
    ];

    let subtitle = 'Todos los reportes';
    if (filters.tipo) subtitle = `Tipo: ${tipoLabels[filters.tipo] || filters.tipo}`;
    if (filters.estado) subtitle += ` | Estado: ${filters.estado}`;

    return ExportService.generatePdf({
      titulo: 'Reportes ILV - KAPA',
      subtitulo: subtitle,
      fechaGeneracion: new Date(),
      secciones
    });
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
