import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

class FieldDto {
  @IsString()
  key: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  value_type?: string;
}

export class CreateInspeccionReportDto {
  @IsEnum(['tecnica', 'auditoria'])
  tipo: 'tecnica' | 'auditoria';

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsNumber()
  cliente_id: number;

  @IsNumber()
  proyecto_id: number;

  @IsOptional()
  @IsNumber()
  empresa_id?: number;

  @IsOptional()
  @IsNumber()
  empresa_auditada_id?: number;

  @IsOptional()
  @IsEnum(['abierto', 'cerrado'])
  estado?: 'abierto' | 'cerrado';

  @IsOptional()
  @IsString()
  observacion?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldDto)
  fields: FieldDto[];
}
