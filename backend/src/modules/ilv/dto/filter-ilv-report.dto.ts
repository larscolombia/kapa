import { IsOptional, IsString, IsInt, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { IlvReportType } from './create-ilv-report.dto';

export class FilterIlvReportDto {
  @IsOptional()
  @IsEnum(IlvReportType)
  tipo?: IlvReportType;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  proyecto_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cliente_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  empresa_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoria_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  subcategoria_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  responsable_id?: number;

  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 50;

  @IsOptional()
  @IsString()
  sortBy?: string = 'creado_en';

  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC' = 'DESC';
}
