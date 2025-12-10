import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Client } from '../../database/entities/client.entity';
import { IlvMaestro } from '../../database/entities/ilv-maestro.entity';
import { InspeccionMaestro } from '../../database/entities/inspeccion-maestro.entity';
import { SystemParameter } from '../../database/entities/system-parameter.entity';
import {
  CreateWorkCenterDto,
  UpdateWorkCenterDto,
  CreateIlvMaestroDto,
  UpdateIlvMaestroDto,
  CreateInspeccionMaestroDto,
  UpdateInspeccionMaestroDto,
  FilterMaestrosDto,
} from './dto';

// Definición de categorías de maestros para el frontend
export const MAESTROS_CONFIG = {
  ilv: {
    label: 'Maestros ILV',
    tipos: {
      tipo_reporte_hid: { label: 'Tipo de Reporte HID', descripcion: 'Tipos de reportes HID', formularios: ['HID'] },
      tipo_hallazgo: { label: 'Tipo de Hallazgo (HID)', descripcion: 'Tipos de hallazgos para HID', formularios: ['HID'] },
      categoria_hid: { label: 'Categoría HID', descripcion: 'Categorías principales HID (jerárquico)', formularios: ['HID'], jerarquico: true },
      subcategoria_hid: { label: 'Subcategoría HID', descripcion: 'Subcategorías HID (hijas de categoría)', formularios: ['HID'], dependeDe: 'categoria_hid' },
      tipo_wit_hallazgo: { label: 'Tipo de Hallazgo (W&T)', descripcion: 'Tipos de hallazgos para Walk & Talk', formularios: ['W&T'] },
      tipo_swa_hallazgo: { label: 'Tipo de Hallazgo (SWA)', descripcion: 'Tipos de hallazgos para Stop Work Authority', formularios: ['SWA'] },
      tipo_swa: { label: 'Tipo de SWA', descripcion: 'Tipos de SWA', formularios: ['SWA'] },
      motivo_swa: { label: 'Motivo SWA', descripcion: 'Motivos para SWA', formularios: ['SWA'] },
      tipo_tarjeta: { label: 'Tipo de Tarjeta', descripcion: 'Tipos de tarjetas FDKAR', formularios: ['FDKAR'] },
      clasificacion_fdkar: { label: 'Clasificación FDKAR', descripcion: 'Clasificaciones para FDKAR', formularios: ['FDKAR'] },
      estado_reporte: { label: 'Estado de Reporte', descripcion: 'Estados de los reportes ILV', formularios: ['HID', 'W&T', 'SWA', 'FDKAR'] },
      area: { label: 'Área', descripcion: 'Áreas generales', formularios: ['Varios'] },
      causa: { label: 'Causa', descripcion: 'Causas de hallazgos', formularios: ['Varios'] },
      severidad: { label: 'Severidad', descripcion: 'Niveles de severidad', formularios: ['Varios'] },
      riesgo: { label: 'Riesgo', descripcion: 'Niveles de riesgo', formularios: ['Varios'] },
      tipo_evidencia: { label: 'Tipo de Evidencia', descripcion: 'Tipos de evidencia', formularios: ['Varios'] },
      tipo_hid: { label: 'Tipo HID', descripcion: 'Tipos HID adicionales', formularios: ['HID'] },
      tipo_hse: { label: 'Tipo HSE', descripcion: 'Tipos HSE', formularios: ['Varios'] },
    }
  },
  inspecciones: {
    label: 'Maestros Inspecciones',
    tipos: {
      tipo_inspeccion_tecnica: { label: 'Tipo de Inspección Técnica', descripcion: 'Tipos de inspección técnica', formularios: ['Técnica'], jerarquico: true },
      clasificacion_inspeccion: { label: 'Clasificación Técnica', descripcion: 'Clasificaciones para inspección técnica', formularios: ['Técnica'], dependeDe: 'tipo_inspeccion_tecnica' },
      area_inspeccion: { label: 'Área de Inspección', descripcion: 'Áreas para inspección técnica', formularios: ['Técnica'] },
      area_auditoria: { label: 'Área de Auditoría', descripcion: 'Áreas para auditoría cruzada', formularios: ['Auditoría'] },
      clasificacion_auditoria: { label: 'Clasificación Auditoría', descripcion: 'Clasificaciones para auditoría cruzada', formularios: ['Auditoría'] },
      estado_reporte: { label: 'Estado de Reporte', descripcion: 'Estados de los reportes de inspección', formularios: ['Técnica', 'Auditoría'] },
    }
  }
};

@Injectable()
export class SystemConfigService {
  constructor(
    @InjectRepository(Client)
    private clientRepo: Repository<Client>,
    @InjectRepository(IlvMaestro)
    private ilvMaestroRepo: Repository<IlvMaestro>,
    @InjectRepository(InspeccionMaestro)
    private inspeccionMaestroRepo: Repository<InspeccionMaestro>,
    @InjectRepository(SystemParameter)
    private parameterRepo: Repository<SystemParameter>,
  ) {}

  // ============================================
  // CONFIGURACIÓN DE MAESTROS (METADATA)
  // ============================================
  
  getMaestrosConfig() {
    return MAESTROS_CONFIG;
  }

  // ============================================
  // CENTROS DE TRABAJO (CLIENTS)
  // ============================================

  async getWorkCenters(): Promise<Client[]> {
    return this.clientRepo.find({
      order: { name: 'ASC' },
    });
  }

  async getWorkCenter(id: number): Promise<Client> {
    const client = await this.clientRepo.findOne({ where: { client_id: id } });
    if (!client) {
      throw new NotFoundException(`Centro de trabajo #${id} no encontrado`);
    }
    return client;
  }

  async createWorkCenter(dto: CreateWorkCenterDto): Promise<Client> {
    // Verificar si ya existe uno con el mismo nombre
    const existing = await this.clientRepo.findOne({
      where: { name: ILike(dto.name) },
    });
    if (existing) {
      throw new ConflictException(`Ya existe un centro de trabajo con el nombre "${dto.name}"`);
    }

    const client = this.clientRepo.create(dto);
    return this.clientRepo.save(client);
  }

  async updateWorkCenter(id: number, dto: UpdateWorkCenterDto): Promise<Client> {
    const client = await this.getWorkCenter(id);

    if (dto.name) {
      // Verificar que el nuevo nombre no exista en otro registro
      const existing = await this.clientRepo.findOne({
        where: { name: ILike(dto.name) },
      });
      if (existing && existing.client_id !== id) {
        throw new ConflictException(`Ya existe un centro de trabajo con el nombre "${dto.name}"`);
      }
    }

    Object.assign(client, dto);
    return this.clientRepo.save(client);
  }

  async deleteWorkCenter(id: number): Promise<void> {
    const client = await this.getWorkCenter(id);
    
    // Verificar que no tenga proyectos asociados
    const clientWithProjects = await this.clientRepo.findOne({
      where: { client_id: id },
      relations: ['projects'],
    });
    
    if (clientWithProjects?.projects?.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar el centro de trabajo "${client.name}" porque tiene ${clientWithProjects.projects.length} proyecto(s) asociado(s)`
      );
    }

    await this.clientRepo.delete(id);
  }

  // ============================================
  // MAESTROS ILV
  // ============================================

  async getIlvMaestros(filters?: FilterMaestrosDto): Promise<IlvMaestro[]> {
    const where: any = {};
    
    if (filters?.tipo) {
      where.tipo = filters.tipo;
    }
    
    if (filters?.activo !== undefined) {
      where.activo = filters.activo;
    } else {
      // Por defecto solo activos
      where.activo = true;
    }

    const maestros = await this.ilvMaestroRepo.find({
      where,
      order: { tipo: 'ASC', orden: 'ASC', valor: 'ASC' },
    });

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      return maestros.filter(m => 
        m.valor.toLowerCase().includes(searchLower) ||
        m.clave.toLowerCase().includes(searchLower)
      );
    }

    return maestros;
  }

  async getIlvMaestro(id: number): Promise<IlvMaestro> {
    const maestro = await this.ilvMaestroRepo.findOne({ where: { maestro_id: id } });
    if (!maestro) {
      throw new NotFoundException(`Maestro ILV #${id} no encontrado`);
    }
    return maestro;
  }

  async getIlvMaestrosByTipo(tipo: string, includeInactive = false): Promise<IlvMaestro[]> {
    const where: any = { tipo };
    if (!includeInactive) {
      where.activo = true;
    }
    return this.ilvMaestroRepo.find({
      where,
      order: { orden: 'ASC', valor: 'ASC' },
    });
  }

  async getIlvMaestrosTree(tipo: string): Promise<any[]> {
    const padres = await this.ilvMaestroRepo.find({
      where: { tipo, activo: true },
      order: { orden: 'ASC', valor: 'ASC' },
    });

    // Determinar el tipo de hijos según el padre
    let tipoHijo: string | null = null;
    if (tipo === 'categoria_hid') {
      tipoHijo = 'subcategoria_hid';
    }

    if (!tipoHijo) {
      return padres;
    }

    return Promise.all(padres.map(async padre => {
      const children = await this.ilvMaestroRepo.find({
        where: {
          tipo: tipoHijo,
          aplica_a_tipo: padre.clave,
          activo: true,
        },
        order: { orden: 'ASC', valor: 'ASC' },
      });

      return {
        ...padre,
        children,
      };
    }));
  }

  async createIlvMaestro(dto: CreateIlvMaestroDto): Promise<IlvMaestro> {
    // Verificar si ya existe
    const existing = await this.ilvMaestroRepo.findOne({
      where: { tipo: dto.tipo, clave: dto.clave },
    });
    if (existing) {
      throw new ConflictException(`Ya existe un maestro con tipo "${dto.tipo}" y clave "${dto.clave}"`);
    }

    // Obtener el orden máximo actual
    const maxOrden = await this.ilvMaestroRepo
      .createQueryBuilder('m')
      .select('MAX(m.orden)', 'max')
      .where('m.tipo = :tipo', { tipo: dto.tipo })
      .getRawOne();

    const maestro = this.ilvMaestroRepo.create({
      ...dto,
      orden: dto.orden ?? (maxOrden?.max ?? 0) + 1,
      activo: dto.activo ?? true,
    });

    return this.ilvMaestroRepo.save(maestro);
  }

  async updateIlvMaestro(id: number, dto: UpdateIlvMaestroDto): Promise<IlvMaestro> {
    const maestro = await this.getIlvMaestro(id);

    if (dto.clave) {
      const existing = await this.ilvMaestroRepo.findOne({
        where: { tipo: maestro.tipo, clave: dto.clave },
      });
      if (existing && existing.maestro_id !== id) {
        throw new ConflictException(`Ya existe un maestro con tipo "${maestro.tipo}" y clave "${dto.clave}"`);
      }
    }

    Object.assign(maestro, dto);
    maestro.updated_at = new Date();
    return this.ilvMaestroRepo.save(maestro);
  }

  async deleteIlvMaestro(id: number, soft = true): Promise<void> {
    const maestro = await this.getIlvMaestro(id);
    
    if (soft) {
      maestro.activo = false;
      maestro.updated_at = new Date();
      await this.ilvMaestroRepo.save(maestro);
    } else {
      await this.ilvMaestroRepo.delete(id);
    }
  }

  async reactivateIlvMaestro(id: number): Promise<IlvMaestro> {
    const maestro = await this.ilvMaestroRepo.findOne({ where: { maestro_id: id } });
    if (!maestro) {
      throw new NotFoundException(`Maestro ILV #${id} no encontrado`);
    }
    
    maestro.activo = true;
    maestro.updated_at = new Date();
    return this.ilvMaestroRepo.save(maestro);
  }

  // ============================================
  // MAESTROS INSPECCIONES
  // ============================================

  async getInspeccionMaestros(filters?: FilterMaestrosDto): Promise<InspeccionMaestro[]> {
    const where: any = {};
    
    if (filters?.tipo) {
      where.tipo = filters.tipo;
    }
    
    if (filters?.activo !== undefined) {
      where.activo = filters.activo;
    } else {
      where.activo = true;
    }

    const maestros = await this.inspeccionMaestroRepo.find({
      where,
      order: { tipo: 'ASC', orden: 'ASC', valor: 'ASC' },
    });

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      return maestros.filter(m => 
        m.valor.toLowerCase().includes(searchLower) ||
        (m.clave?.toLowerCase().includes(searchLower) ?? false)
      );
    }

    return maestros;
  }

  async getInspeccionMaestro(id: number): Promise<InspeccionMaestro> {
    const maestro = await this.inspeccionMaestroRepo.findOne({ where: { maestro_id: id } });
    if (!maestro) {
      throw new NotFoundException(`Maestro de Inspección #${id} no encontrado`);
    }
    return maestro;
  }

  async getInspeccionMaestrosByTipo(tipo: string, includeInactive = false): Promise<InspeccionMaestro[]> {
    const where: any = { tipo };
    if (!includeInactive) {
      where.activo = true;
    }
    return this.inspeccionMaestroRepo.find({
      where,
      order: { orden: 'ASC', valor: 'ASC' },
    });
  }

  async getInspeccionMaestrosTree(tipo: string): Promise<any[]> {
    // Para inspecciones, el padre es tipo_inspeccion_tecnica y los hijos son clasificacion_inspeccion
    const padres = await this.inspeccionMaestroRepo.find({
      where: { tipo, activo: true },
      order: { orden: 'ASC', valor: 'ASC' },
    });

    let tipoHijo: string | null = null;
    if (tipo === 'tipo_inspeccion_tecnica') {
      tipoHijo = 'clasificacion_inspeccion';
    }

    if (!tipoHijo) {
      return padres;
    }

    return Promise.all(padres.map(async padre => {
      const children = await this.inspeccionMaestroRepo.find({
        where: {
          tipo: tipoHijo,
          padre_id: padre.maestro_id,
          activo: true,
        },
        order: { orden: 'ASC', valor: 'ASC' },
      });

      return {
        ...padre,
        children,
      };
    }));
  }

  async createInspeccionMaestro(dto: CreateInspeccionMaestroDto): Promise<InspeccionMaestro> {
    // Verificar existencia si tiene clave
    if (dto.clave) {
      const existing = await this.inspeccionMaestroRepo.findOne({
        where: { tipo: dto.tipo, clave: dto.clave },
      });
      if (existing) {
        throw new ConflictException(`Ya existe un maestro con tipo "${dto.tipo}" y clave "${dto.clave}"`);
      }
    }

    // Obtener orden máximo
    const maxOrden = await this.inspeccionMaestroRepo
      .createQueryBuilder('m')
      .select('MAX(m.orden)', 'max')
      .where('m.tipo = :tipo', { tipo: dto.tipo })
      .getRawOne();

    const maestro = this.inspeccionMaestroRepo.create({
      ...dto,
      orden: dto.orden ?? (maxOrden?.max ?? 0) + 1,
      activo: dto.activo ?? true,
    });

    return this.inspeccionMaestroRepo.save(maestro);
  }

  async updateInspeccionMaestro(id: number, dto: UpdateInspeccionMaestroDto): Promise<InspeccionMaestro> {
    const maestro = await this.getInspeccionMaestro(id);

    if (dto.clave) {
      const existing = await this.inspeccionMaestroRepo.findOne({
        where: { tipo: maestro.tipo, clave: dto.clave },
      });
      if (existing && existing.maestro_id !== id) {
        throw new ConflictException(`Ya existe un maestro con tipo "${maestro.tipo}" y clave "${dto.clave}"`);
      }
    }

    Object.assign(maestro, dto);
    return this.inspeccionMaestroRepo.save(maestro);
  }

  async deleteInspeccionMaestro(id: number, soft = true): Promise<void> {
    const maestro = await this.getInspeccionMaestro(id);
    
    if (soft) {
      maestro.activo = false;
      await this.inspeccionMaestroRepo.save(maestro);
    } else {
      await this.inspeccionMaestroRepo.delete(id);
    }
  }

  async reactivateInspeccionMaestro(id: number): Promise<InspeccionMaestro> {
    const maestro = await this.inspeccionMaestroRepo.findOne({ where: { maestro_id: id } });
    if (!maestro) {
      throw new NotFoundException(`Maestro de Inspección #${id} no encontrado`);
    }
    
    maestro.activo = true;
    return this.inspeccionMaestroRepo.save(maestro);
  }

  // ============================================
  // ESTADÍSTICAS Y RESUMEN
  // ============================================

  async getSystemStats() {
    const [
      workCentersCount,
      ilvMaestrosCount,
      inspeccionMaestrosCount,
      ilvTiposCount,
      inspeccionTiposCount,
    ] = await Promise.all([
      this.clientRepo.count(),
      this.ilvMaestroRepo.count({ where: { activo: true } }),
      this.inspeccionMaestroRepo.count({ where: { activo: true } }),
      this.ilvMaestroRepo
        .createQueryBuilder('m')
        .select('m.tipo')
        .where('m.activo = true')
        .groupBy('m.tipo')
        .getCount(),
      this.inspeccionMaestroRepo
        .createQueryBuilder('m')
        .select('m.tipo')
        .where('m.activo = true')
        .groupBy('m.tipo')
        .getCount(),
    ]);

    return {
      workCenters: workCentersCount,
      ilvMaestros: {
        total: ilvMaestrosCount,
        tipos: ilvTiposCount,
      },
      inspeccionMaestros: {
        total: inspeccionMaestrosCount,
        tipos: inspeccionTiposCount,
      },
    };
  }

  async getIlvMaestrosSummary(): Promise<{ tipo: string; count: number; label: string }[]> {
    const result = await this.ilvMaestroRepo
      .createQueryBuilder('m')
      .select('m.tipo', 'tipo')
      .addSelect('COUNT(*)', 'count')
      .where('m.activo = true')
      .groupBy('m.tipo')
      .orderBy('m.tipo', 'ASC')
      .getRawMany();

    return result.map(r => ({
      tipo: r.tipo,
      count: parseInt(r.count),
      label: MAESTROS_CONFIG.ilv.tipos[r.tipo]?.label || r.tipo,
    }));
  }

  async getInspeccionMaestrosSummary(): Promise<{ tipo: string; count: number; label: string }[]> {
    const result = await this.inspeccionMaestroRepo
      .createQueryBuilder('m')
      .select('m.tipo', 'tipo')
      .addSelect('COUNT(*)', 'count')
      .where('m.activo = true')
      .groupBy('m.tipo')
      .orderBy('m.tipo', 'ASC')
      .getRawMany();

    return result.map(r => ({
      tipo: r.tipo,
      count: parseInt(r.count),
      label: MAESTROS_CONFIG.inspecciones.tipos[r.tipo]?.label || r.tipo,
    }));
  }

  // ============================================
  // PARÁMETROS DEL SISTEMA
  // ============================================

  /**
   * Obtiene todos los parámetros del sistema agrupados por categoría
   */
  async getParameters(): Promise<{ category: string; parameters: SystemParameter[] }[]> {
    const params = await this.parameterRepo.find({
      order: { category: 'ASC', label: 'ASC' },
    });

    // Agrupar por categoría
    const grouped = params.reduce((acc, param) => {
      if (!acc[param.category]) {
        acc[param.category] = [];
      }
      acc[param.category].push(param);
      return acc;
    }, {} as Record<string, SystemParameter[]>);

    return Object.entries(grouped).map(([category, parameters]) => ({
      category,
      parameters,
    }));
  }

  /**
   * Obtiene parámetros por categoría
   */
  async getParametersByCategory(category: string): Promise<SystemParameter[]> {
    return this.parameterRepo.find({
      where: { category },
      order: { label: 'ASC' },
    });
  }

  /**
   * Obtiene un parámetro por su key
   */
  async getParameter(key: string): Promise<SystemParameter> {
    const param = await this.parameterRepo.findOne({ where: { key } });
    if (!param) {
      throw new NotFoundException(`Parámetro '${key}' no encontrado`);
    }
    return param;
  }

  /**
   * Obtiene el valor de un parámetro parseado según su tipo
   */
  async getParameterValue(key: string): Promise<string | number | boolean | object> {
    const param = await this.getParameter(key);
    return param.getParsedValue();
  }

  /**
   * Obtiene múltiples parámetros por sus keys
   */
  async getParameterValues(keys: string[]): Promise<Record<string, string | number | boolean | object>> {
    const params = await this.parameterRepo.find({
      where: keys.map(key => ({ key })),
    });

    return params.reduce((acc, param) => {
      acc[param.key] = param.getParsedValue();
      return acc;
    }, {} as Record<string, string | number | boolean | object>);
  }

  /**
   * Actualiza un parámetro
   */
  async updateParameter(key: string, value: string): Promise<SystemParameter> {
    const param = await this.getParameter(key);
    
    if (!param.editable) {
      throw new BadRequestException(`El parámetro '${key}' no es editable`);
    }

    // Validar según tipo de dato
    this.validateParameterValue(value, param.data_type);

    param.value = value;
    return this.parameterRepo.save(param);
  }

  /**
   * Actualiza múltiples parámetros
   */
  async updateParameters(updates: { key: string; value: string }[]): Promise<SystemParameter[]> {
    const results: SystemParameter[] = [];
    
    for (const { key, value } of updates) {
      const updated = await this.updateParameter(key, value);
      results.push(updated);
    }
    
    return results;
  }

  /**
   * Valida el valor según el tipo de dato
   */
  private validateParameterValue(value: string, dataType: string): void {
    switch (dataType) {
      case 'number':
        if (isNaN(parseFloat(value))) {
          throw new BadRequestException('El valor debe ser un número válido');
        }
        break;
      case 'boolean':
        if (!['true', 'false'].includes(value.toLowerCase())) {
          throw new BadRequestException('El valor debe ser "true" o "false"');
        }
        break;
      case 'json':
        try {
          JSON.parse(value);
        } catch {
          throw new BadRequestException('El valor debe ser un JSON válido');
        }
        break;
    }
  }

  /**
   * Obtiene las categorías de parámetros disponibles
   */
  async getParameterCategories(): Promise<string[]> {
    const result = await this.parameterRepo
      .createQueryBuilder('p')
      .select('DISTINCT p.category', 'category')
      .orderBy('p.category', 'ASC')
      .getRawMany();

    return result.map(r => r.category);
  }
}
