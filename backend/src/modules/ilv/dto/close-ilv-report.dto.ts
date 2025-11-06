import { IsString, IsOptional, IsArray } from 'class-validator';

export class CloseIlvReportDto {
  @IsString()
  plan_accion: string;

  @IsOptional()
  @IsString()
  evidencia_cierre?: string;

  @IsOptional()
  @IsString()
  fecha_implantacion?: string;

  @IsOptional()
  @IsArray()
  attachments?: any[];
}
