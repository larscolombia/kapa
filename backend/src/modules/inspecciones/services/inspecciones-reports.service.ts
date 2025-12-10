import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { InspeccionReport } from '../../../database/entities/inspeccion-report.entity';
import { InspeccionReportField } from '../../../database/entities/inspeccion-report-field.entity';
import { InspeccionMaestro } from '../../../database/entities/inspeccion-maestro.entity';
import { FormSubmission } from '../../../database/entities/form-submission.entity';
import { FormTemplate } from '../../../database/entities/form-template.entity';
import { CreateInspeccionReportDto } from '../dto/create-inspeccion-report.dto';
import { UpdateInspeccionReportDto } from '../dto/update-inspeccion-report.dto';
import { FilterInspeccionDto } from '../dto/filter-inspeccion.dto';
import { InspeccionesNotificationsService } from './inspecciones-notifications.service';
import { ExportService, PdfReportData, PdfSection } from '../../../common/services/export.service';

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
  private notificationsService: InspeccionesNotificationsService;

  constructor(
    @InjectRepository(InspeccionReport)
    private reportRepo: Repository<InspeccionReport>,
    @InjectRepository(InspeccionReportField)
    private fieldRepo: Repository<InspeccionReportField>,
    @InjectRepository(InspeccionMaestro)
    private maestroRepo: Repository<InspeccionMaestro>,
  ) {
    this.notificationsService = new InspeccionesNotificationsService();
  }

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

    // Obtener reporte completo con relaciones para notificación
    const fullReport = await this.findOne(savedReport.report_id);
    
    // Enviar notificación de creación (async, no bloquea)
    this.notificationsService.sendReportCreatedEmail(fullReport).catch(err => {
      console.error(`Error enviando notificación para inspección #${savedReport.report_id}:`, err);
    });

    return fullReport;
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

    // Filtro por clasificación técnica (busca en campos)
    if (filters.clasificacion_inspeccion_id) {
      qb.andWhere(
        `EXISTS (SELECT 1 FROM inspeccion_report_field f WHERE f.report_id = r.report_id AND f.key = 'clasificacion_inspeccion_id' AND f.value = :clfTec)`,
        { clfTec: String(filters.clasificacion_inspeccion_id) }
      );
    }

    // Filtro por clasificación de auditoría (busca en campos)
    if (filters.clasificacion_auditoria_id) {
      qb.andWhere(
        `EXISTS (SELECT 1 FROM inspeccion_report_field f WHERE f.report_id = r.report_id AND f.key = 'clasificacion_auditoria_id' AND f.value = :clfAud)`,
        { clfAud: String(filters.clasificacion_auditoria_id) }
      );
    }

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

    // Ordenamiento dinámico
    const sortBy = filters.sortBy || 'creado_en';
    const order = filters.order === 'ASC' ? 'ASC' : 'DESC';
    
    // Mapear campos de ordenamiento a columnas de la BD
    const sortMapping: { [key: string]: string } = {
      'report_id': 'r.report_id',
      'tipo': 'r.tipo',
      'estado': 'r.estado',
      'fecha': 'r.fecha',
      'creado_en': 'r.creado_en',
      'cliente': 'client.name',
      'proyecto': 'project.name',
      'empresa': 'contractor.name'
    };
    
    const orderColumn = sortMapping[sortBy] || 'r.creado_en';
    qb.orderBy(orderColumn, order);

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
    const previousState = report.estado;
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

    // Obtener reporte completo con relaciones
    const fullReport = await this.findOne(id);

    // Enviar notificación si el estado cambió a cerrado
    if (dto.estado === 'cerrado' && previousState !== 'cerrado') {
      this.notificationsService.sendReportClosedEmail(fullReport).catch(err => {
        console.error(`Error enviando notificación de cierre para inspección #${id}:`, err);
      });
    }

    return fullReport;
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
   * Obtener todas las clasificaciones técnicas (sin filtro de padre)
   */
  async getAllClasificacionesTecnicas(): Promise<InspeccionMaestro[]> {
    return this.maestroRepo.createQueryBuilder('m')
      .where('m.tipo = :tipo', { tipo: 'clasificacion_inspeccion' })
      .andWhere('m.activo = true')
      .orderBy('m.orden', 'ASC')
      .getMany();
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
   * Exportar listado de inspecciones a Excel
   */
  async exportToExcel(filters: FilterInspeccionDto, userId: number): Promise<Buffer> {
    const { data } = await this.findAll(filters, userId);

    const columns = [
      { header: 'ID', key: 'report_id', width: 8 },
      { header: 'Tipo', key: 'tipo_label', width: 20 },
      { header: 'Estado', key: 'estado', width: 12 },
      { header: 'Centro de Trabajo', key: 'cliente', width: 25 },
      { header: 'Proyecto', key: 'proyecto', width: 25 },
      { header: 'Empresa', key: 'empresa', width: 25 },
      { header: 'Fecha Inspección', key: 'fecha', width: 15 },
      { header: 'Creado Por', key: 'creador', width: 20 },
      { header: 'Fecha Creación', key: 'fecha_creacion', width: 15 },
    ];

    const excelData = data.map(r => ({
      report_id: r.report_id,
      tipo_label: r.tipo === 'tecnica' ? 'Inspección Técnica' : 'Auditoría Cruzada',
      estado: r.estado === 'abierto' ? 'Abierto' : 'Cerrado',
      cliente: r.client?.name || 'N/A',
      proyecto: r.project?.name || 'N/A',
      empresa: r.contractor?.name || 'N/A',
      fecha: r.fecha ? new Date(r.fecha).toLocaleDateString('es-CO') : 'N/A',
      creador: r.created_by?.name || 'N/A',
      fecha_creacion: r.creado_en ? new Date(r.creado_en).toLocaleDateString('es-CO') : 'N/A',
    }));

    let subtitle = 'Todas las inspecciones';
    if (filters.tipo) subtitle = `Tipo: ${filters.tipo === 'tecnica' ? 'Inspección Técnica' : 'Auditoría Cruzada'}`;
    if (filters.estado) subtitle += ` | Estado: ${filters.estado}`;
    if (filters.fecha_desde || filters.fecha_hasta) {
      subtitle += ` | Período: ${filters.fecha_desde || '*'} - ${filters.fecha_hasta || '*'}`;
    }

    return ExportService.generateExcel({
      title: 'Inspecciones - KAPA',
      subtitle,
      columns,
      data: excelData,
      sheetName: 'Inspecciones'
    });
  }

  /**
   * Procesar campos del form builder para mostrarlos de forma legible
   */
  private processFormBuilderData(data: any, schema: any): { label: string; value: string }[] {
    const result: { label: string; value: string }[] = [];
    const schemaFields = schema?.fields || [];

    // Crear un mapa de campos del schema para acceso rápido
    const fieldMap = this.buildFieldMap(schemaFields);

    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined || value === '') continue;

      const fieldInfo = fieldMap.get(key);
      const label = fieldInfo?.label || this.formatFieldKey(key);
      const fieldType = fieldInfo?.type || 'text';

      // Procesar según el tipo de campo
      const formattedValue = this.formatFieldValue(value, fieldType, fieldInfo);
      
      if (formattedValue) {
        result.push({ label, value: formattedValue });
      }
    }

    return result;
  }

  /**
   * Construir un mapa plano de todos los campos del schema (incluyendo anidados)
   */
  private buildFieldMap(fields: any[], parentKey = ''): Map<string, any> {
    const map = new Map<string, any>();

    for (const field of fields || []) {
      const key = field.key || field.id;
      if (key) {
        map.set(key, field);
      }

      // Campos anidados (para grupos, repeaters, etc.)
      if (field.fields && Array.isArray(field.fields)) {
        const nestedMap = this.buildFieldMap(field.fields, key);
        nestedMap.forEach((v, k) => map.set(k, v));
      }

      // Opciones de radio/checkbox/select
      if (field.options && Array.isArray(field.options)) {
        for (const option of field.options) {
          if (option.key) {
            map.set(option.key, { ...option, parentField: field });
          }
        }
      }
    }

    return map;
  }

  /**
   * Formatear una clave de campo para mostrarla legible
   */
  private formatFieldKey(key: string): string {
    // Remover prefijos como text_, radio_, textarea_, etc.
    const cleanKey = key.replace(/^(text|radio|textarea|checkbox|select|number|date|repeater|group)_[a-f0-9]+$/i, 'Campo');
    if (cleanKey === 'Campo') return 'Campo';
    
    return key
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Formatear el valor de un campo según su tipo
   */
  private formatFieldValue(value: any, fieldType: string, fieldInfo?: any): string {
    if (value === null || value === undefined) return '';

    // Manejar arrays (repeaters)
    if (Array.isArray(value)) {
      return this.formatRepeaterValue(value, fieldInfo);
    }

    // Manejar objetos
    if (typeof value === 'object') {
      return this.formatObjectValue(value, fieldInfo);
    }

    // Manejar valores de radio/select - buscar el label de la opción
    if ((fieldType === 'radio' || fieldType === 'select') && fieldInfo?.options) {
      const option = fieldInfo.options.find((opt: any) => 
        opt.value === value || opt.key === value
      );
      if (option) {
        return option.label || option.value || String(value);
      }
    }

    // Manejar booleanos
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }

    // Manejar fechas
    if (fieldType === 'date' && value) {
      try {
        return new Date(value).toLocaleDateString('es-CO');
      } catch {
        return String(value);
      }
    }

    return String(value);
  }

  /**
   * Formatear un valor de tipo repeater (array de objetos)
   */
  private formatRepeaterValue(items: any[], fieldInfo?: any): string {
    if (!items || items.length === 0) return '';

    const repeaterFields = fieldInfo?.fields || [];
    const fieldMap = this.buildFieldMap(repeaterFields);

    const formattedItems = items.map((item, index) => {
      const itemLines: string[] = [];
      
      for (const [key, val] of Object.entries(item)) {
        if (val === null || val === undefined || val === '') continue;
        
        const subFieldInfo = fieldMap.get(key);
        const label = subFieldInfo?.label || this.formatFieldKey(key);
        const fieldType = subFieldInfo?.type || 'text';
        
        let displayValue: string;
        
        // Para radios y selects, buscar el label de la opción
        if ((fieldType === 'radio' || fieldType === 'select') && subFieldInfo?.options) {
          const option = subFieldInfo.options.find((opt: any) => 
            opt.value === val || opt.key === val
          );
          displayValue = option?.label || String(val);
        } else if (typeof val === 'object') {
          displayValue = JSON.stringify(val);
        } else {
          displayValue = String(val);
        }
        
        itemLines.push(`${label}: ${displayValue}`);
      }
      
      return `[Registro ${index + 1}]\n${itemLines.join('\n')}`;
    });

    return formattedItems.join('\n\n');
  }

  /**
   * Formatear un valor de tipo objeto
   */
  private formatObjectValue(obj: any, fieldInfo?: any): string {
    const lines: string[] = [];
    
    for (const [key, val] of Object.entries(obj)) {
      if (val === null || val === undefined || val === '') continue;
      const label = this.formatFieldKey(key);
      lines.push(`${label}: ${String(val)}`);
    }
    
    return lines.join(', ');
  }

  /**
   * Exportar una inspección individual a PDF
   */
  async exportToPdf(reportId: number): Promise<Buffer> {
    const report = await this.findOne(reportId);

    const fieldLabels: Record<string, string> = {
      'tipo_inspeccion_id': 'Tipo de Inspección',
      'clasificacion_inspeccion_id': 'Clasificación',
      'area_inspeccion_id': 'Área de Inspección',
      'descripcion_area': 'Descripción del Área',
      'quien_reporta_id': 'Quien Reporta',
      'area_auditoria_id': 'Área de Auditoría',
      'clasificacion_auditoria_id': 'Clasificación de Auditoría',
      'hallazgos': 'Hallazgos',
      'acciones_correctivas': 'Acciones Correctivas',
      'observacion': 'Observación'
    };

    // Información general del reporte
    const infoGeneral: PdfSection = {
      titulo: 'Información General',
      campos: [
        { label: 'ID del Reporte', value: report.report_id },
        { label: 'Tipo de Inspección', value: report.tipo === 'tecnica' ? 'Inspección Técnica' : 'Auditoría Cruzada' },
        { label: 'Estado', value: report.estado === 'abierto' ? 'Abierto' : 'Cerrado' },
        { label: 'Centro de Trabajo', value: report.client?.name || 'N/A' },
        { label: 'Proyecto', value: report.project?.name || 'N/A' },
        { label: 'Empresa', value: report.contractor?.name || 'N/A' },
        { label: 'Fecha de Inspección', value: report.fecha ? new Date(report.fecha).toLocaleDateString('es-CO') : 'N/A' },
        { label: 'Creado Por', value: report.created_by?.name || 'N/A' },
        { label: 'Fecha de Creación', value: report.creado_en ? new Date(report.creado_en).toLocaleString('es-CO') : 'N/A' },
      ]
    };

    // Campos dinámicos del formulario
    const camposFormulario: PdfSection = {
      titulo: 'Detalles de la Inspección',
      campos: []
    };

    for (const field of report.fields) {
      const label = fieldLabels[field.key] || field.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const value = field.value_display || field.value;
      camposFormulario.campos.push({ label, value });
    }

    const secciones: PdfSection[] = [infoGeneral];
    if (camposFormulario.campos.length > 0) {
      secciones.push(camposFormulario);
    }

    // Obtener formularios dinámicos (form builder) si existen
    try {
      const formSubmissions = await this.fieldRepo.query(
        `SELECT fs.*, ft.name as form_name, ft.schema 
         FROM form_submission fs
         JOIN form_template ft ON fs.form_template_id = ft.form_template_id
         WHERE fs.inspeccion_report_id = $1`,
        [reportId]
      );

      for (const submission of formSubmissions) {
        const formSection: PdfSection = {
          titulo: `Formulario: ${submission.form_name}`,
          campos: []
        };

        const data = submission.data || {};
        const schema = submission.schema as any;

        // Usar el nuevo método para procesar los datos del form builder
        formSection.campos = this.processFormBuilderData(data, schema);

        if (formSection.campos.length > 0) {
          secciones.push(formSection);
        }
      }
    } catch (error) {
      console.warn('Error obteniendo formularios dinámicos:', error);
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
      titulo: `Inspección #${report.report_id}`,
      subtitulo: report.tipo === 'tecnica' ? 'Inspección Técnica' : 'Auditoría Cruzada',
      fechaGeneracion: new Date(),
      secciones
    };

    return ExportService.generatePdf(pdfData);
  }

  /**
   * Exportar múltiples inspecciones a PDF (resumen)
   */
  async exportListToPdf(filters: FilterInspeccionDto, userId: number): Promise<Buffer> {
    const { data } = await this.findAll(filters, userId);

    // Estadísticas
    const stats = {
      total: data.length,
      abiertos: data.filter(r => r.estado === 'abierto').length,
      cerrados: data.filter(r => r.estado === 'cerrado').length,
      tecnicas: data.filter(r => r.tipo === 'tecnica').length,
      auditorias: data.filter(r => r.tipo === 'auditoria').length
    };

    const secciones: PdfSection[] = [
      {
        titulo: 'Resumen',
        campos: [
          { label: 'Total de Inspecciones', value: stats.total },
          { label: 'Inspecciones Abiertas', value: stats.abiertos },
          { label: 'Inspecciones Cerradas', value: stats.cerrados },
          { label: 'Inspecciones Técnicas', value: stats.tecnicas },
          { label: 'Auditorías Cruzadas', value: stats.auditorias },
        ]
      },
      {
        titulo: 'Listado de Inspecciones',
        campos: [],
        tabla: {
          headers: ['ID', 'Tipo', 'Estado', 'Cliente', 'Proyecto', 'Fecha'],
          rows: data.slice(0, 50).map(r => [
            r.report_id,
            r.tipo === 'tecnica' ? 'Inspección Técnica' : 'Auditoría Cruzada',
            r.estado === 'abierto' ? 'Abierto' : 'Cerrado',
            r.client?.name || 'N/A',
            r.project?.name || 'N/A',
            r.fecha ? new Date(r.fecha).toLocaleDateString('es-CO') : 'N/A'
          ])
        }
      }
    ];

    let subtitle = 'Todas las inspecciones';
    if (filters.tipo) subtitle = `Tipo: ${filters.tipo === 'tecnica' ? 'Inspección Técnica' : 'Auditoría Cruzada'}`;
    if (filters.estado) subtitle += ` | Estado: ${filters.estado}`;

    return ExportService.generatePdf({
      titulo: 'Inspecciones - KAPA',
      subtitulo: subtitle,
      fechaGeneracion: new Date(),
      secciones
    });
  }
}
