import { IlbReportType } from '../dto';

export interface FieldConfig {
  required: string[];
  optional: string[];
  maestros: Record<string, string>;
  validations?: Record<string, string>;
  close_required?: string[];
}

export const FIELD_MAPPINGS: Record<IlbReportType, FieldConfig> = {
  [IlbReportType.HAZARD_ID]: {
    required: ['ubicacion', 'descripcion_condicion', 'severidad', 'area', 'fecha_evento'],
    optional: ['foto', 'causa_probable', 'accion_inmediata'],
    maestros: {
      severidad: 'severidad',
      area: 'area',
      causa_probable: 'causa',
    },
    validations: {
      fecha_evento: 'date_lte_today',
    },
  },
  [IlbReportType.WIT]: {
    required: ['conducta_observada', 'riesgo_asociado', 'recomendacion', 'responsable'],
    optional: ['testigo', 'adjuntos'],
    maestros: {
      riesgo_asociado: 'riesgo',
    },
  },
  [IlbReportType.SWA]: {
    required: ['hora_inicio_parada', 'hora_reinicio', 'motivo', 'area', 'responsable'],
    optional: [],
    maestros: {
      motivo: 'motivo_swa',
      area: 'area',
    },
    validations: {
      hora_reinicio: 'time_gte_hora_inicio_parada',
    },
  },
  [IlbReportType.FDKAR]: {
    required: ['quien_reporta', 'clasificacion', 'descripcion', 'plan_accion_propuesto'],
    optional: [],
    maestros: {
      clasificacion: 'clasificacion_fdkar',
    },
    close_required: ['evidencia_cierre', 'fecha_implantacion'],
  },
};

export class FieldMapper {
  static getRequiredFields(tipo: IlbReportType): string[] {
    return FIELD_MAPPINGS[tipo]?.required || [];
  }

  static getOptionalFields(tipo: IlbReportType): string[] {
    return FIELD_MAPPINGS[tipo]?.optional || [];
  }

  static getMaestros(tipo: IlbReportType): Record<string, string> {
    return FIELD_MAPPINGS[tipo]?.maestros || {};
  }

  static getValidations(tipo: IlbReportType): Record<string, string> {
    return FIELD_MAPPINGS[tipo]?.validations || {};
  }

  static getCloseRequiredFields(tipo: IlbReportType): string[] {
    return FIELD_MAPPINGS[tipo]?.close_required || [];
  }

  static getAllFields(tipo: IlbReportType): string[] {
    const config = FIELD_MAPPINGS[tipo];
    if (!config) return [];
    return [...config.required, ...config.optional];
  }
}
