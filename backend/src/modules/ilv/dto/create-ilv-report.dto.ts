import { IsString, IsInt, IsOptional, IsArray, ValidateNested, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum IlbReportType {
  HAZARD_ID = 'hazard_id',
  WIT = 'wit',
  SWA = 'swa',
  FDKAR = 'fdkar',
}

export class IlbReportFieldDto {
  @IsString()
  key: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  value_type?: string;
}

export class CreateIlbReportDto {
  @IsEnum(IlbReportType)
  tipo: IlbReportType;

  @IsOptional()
  @IsInt()
  centro_id?: number;

  @IsInt()
  proyecto_id: number;

  @IsInt()
  cliente_id: number;

  @IsOptional()
  @IsInt()
  empresa_id?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IlbReportFieldDto)
  fields: IlbReportFieldDto[];
}
