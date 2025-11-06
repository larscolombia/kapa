export type IlbReportType = 'hazard_id' | 'wit' | 'swa' | 'fdkar';
export type IlbReportStatus = 'abierto' | 'cerrado';

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

export interface IlbReportWithFields {
  report_id: number;
  tipo: string;
  estado: string;
  fields: Record<string, any>;
  [key: string]: any;
}
