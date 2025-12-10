import { 
  IsNumber, 
  IsOptional, 
  IsObject, 
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para crear/actualizar un borrador
 */
export class SaveFormDraftDto {
  @IsNumber()
  form_template_id: number;

  @IsOptional()
  @IsNumber()
  inspeccion_report_id?: number;

  @IsObject()
  data: Record<string, any>;

  @IsOptional()
  @IsString()
  last_field_edited?: string;
}

/**
 * DTO para filtrar borradores
 */
export class FilterFormDraftDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  form_template_id?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  inspeccion_report_id?: number;
}
