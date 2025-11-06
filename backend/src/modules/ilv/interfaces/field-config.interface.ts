export type IlvReportType = 'hazard_id' | 'wit' | 'swa' | 'fdkar';
export type IlvReportStatus = 'abierto' | 'cerrado';

export interface FieldConfig {
  required: string[];
  optional: string[];
  maestros?: Record<string, string>;
  validations?: Record<string, string>;
  close_required?: string[];
}

export interface IlbFieldConfigs {
  hazard_id: FieldConfig;
  wit: FieldConfig;
  swa: FieldConfig;
  fdkar: FieldConfig;
}

export interface IlvReportWithFields {
  report_id: number;
  tipo: string;
  estado: string;
  fields: Record<string, any>;
  [key: string]: any;
}
