import { IsString, IsOptional, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
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

export class UpdateInspeccionReportDto {
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsEnum(['abierto', 'cerrado'])
  estado?: 'abierto' | 'cerrado';

  @IsOptional()
  @IsString()
  observacion?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldDto)
  fields?: FieldDto[];
}
