import { IlvReportType } from '../dto';

export interface FieldConfig {
  required: string[];
  optional: string[];
  maestros: Record<string, string>;
  validations?: Record<string, string>;
  close_required?: string[];
}

export const FIELD_MAPPINGS: Record<IlvReportType, FieldConfig> = {
  [IlvReportType.HAZARD_ID]: {
    required: [
      'ubicacion',
      'descripcion_condicion',
      'severidad',
      'area',
      'fecha_evento',
      'nombre_quien_reporta',
      'tipo_reporte_hid',
      'categoria',
      'subcategoria'
    ],
    optional: [
      'foto',
      'causa_probable',
      'accion_inmediata',
      'nombre_ehs_contratista',
      'nombre_supervisor_obra',
      'observacion'
    ],
    maestros: {
      severidad: 'severidad',
      area: 'area',
      causa_probable: 'causa',
      tipo_reporte_hid: 'tipo_hid',
      categoria: 'categoria_hid',
      subcategoria: 'subcategoria_hid'
    },
    validations: {
      fecha_evento: 'date_lte_today',
    },
    close_required: ['descripcion_cierre'],
  },
  [IlvReportType.WIT]: {
    required: [], // Validación flexible - frontend valida
    optional: ['nombre_quien_reporta', 'conducta_observada', 'recomendacion', 'tipo', 'testigo', 'adjuntos', 'observacion', 'fecha', 'cliente', 'proyecto', 'empresa_pertenece', 'empresa_genera_reporte', 'estado'],
    maestros: {
      tipo: 'tipo_wit_hallazgo',
    },
    close_required: ['descripcion_cierre'],
  },
  [IlvReportType.SWA]: {
    required: [], // Validación flexible - frontend valida
    optional: ['nombre_quien_reporta', 'nombre_ehs_contratista', 'nombre_supervisor_obra', 'descripcion_hallazgo', 'hora_inicio_parada', 'hora_reinicio', 'tipo', 'tipo_swa', 'observacion', 'descripcion_cierre', 'fecha', 'cliente', 'proyecto', 'empresa_pertenece', 'empresa_genera_reporte', 'estado'],
    maestros: {
      tipo: 'tipo_swa_hallazgo',
      tipo_swa: 'tipo_swa',
    },
    validations: {
      hora_reinicio: 'time_gte_hora_inicio_parada',
    },
    close_required: ['descripcion_cierre'],
  },
  [IlvReportType.FDKAR]: {
    required: [], // Validación flexible - frontend valida
    optional: ['nombre_quien_reporta', 'tipo_tarjeta', 'descripcion_hallazgo', 'observacion', 'descripcion_cierre', 'fecha', 'cliente', 'proyecto', 'empresa_genera_reporte', 'estado'],
    maestros: {
      tipo_tarjeta: 'tipo_tarjeta',
    },
    close_required: ['descripcion_cierre', 'evidencia_cierre', 'fecha_implantacion'],
  },
};

export class FieldMapper {
  static getRequiredFields(tipo: IlvReportType): string[] {
    return FIELD_MAPPINGS[tipo]?.required || [];
  }

  static getOptionalFields(tipo: IlvReportType): string[] {
    return FIELD_MAPPINGS[tipo]?.optional || [];
  }

  static getMaestros(tipo: IlvReportType): Record<string, string> {
    return FIELD_MAPPINGS[tipo]?.maestros || {};
  }

  static getValidations(tipo: IlvReportType): Record<string, string> {
    return FIELD_MAPPINGS[tipo]?.validations || {};
  }

  static getCloseRequiredFields(tipo: IlvReportType): string[] {
    return FIELD_MAPPINGS[tipo]?.close_required || [];
  }

  static getAllFields(tipo: IlvReportType): string[] {
    const config = FIELD_MAPPINGS[tipo];
    if (!config) return [];
    return [...config.required, ...config.optional];
  }
}
