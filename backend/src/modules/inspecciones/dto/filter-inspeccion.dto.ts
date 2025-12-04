import { IsOptional, IsNumber, IsString, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterInspeccionDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsEnum(['tecnica', 'auditoria'])
  tipo?: 'tecnica' | 'auditoria';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  proyecto_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cliente_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  empresa_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  empresa_auditada_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tipo_inspeccion_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  clasificacion_inspeccion_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  area_auditoria_id?: number;

  @IsOptional()
  @IsEnum(['abierto', 'cerrado'])
  estado?: 'abierto' | 'cerrado';

  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
