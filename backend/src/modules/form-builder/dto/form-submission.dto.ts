import { 
  IsNumber, 
  IsOptional, 
  IsObject, 
  IsString,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SubmissionStatus } from '../../../database/entities/form-submission.entity';

/**
 * DTO para crear/actualizar una respuesta de formulario
 */
export class CreateFormSubmissionDto {
  @IsNumber()
  form_template_id: number;

  @IsNumber()
  inspeccion_report_id: number;

  @IsObject()
  data: Record<string, any>;

  @IsOptional()
  @IsEnum(['completed', 'draft', 'partial'])
  status?: SubmissionStatus;
}

/**
 * DTO para actualizar una respuesta de formulario
 */
export class UpdateFormSubmissionDto {
  @IsObject()
  data: Record<string, any>;

  @IsOptional()
  @IsEnum(['completed', 'draft', 'partial'])
  status?: SubmissionStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  change_reason?: string;
}

/**
 * DTO para filtrar respuestas
 */
export class FilterFormSubmissionDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  form_template_id?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  inspeccion_report_id?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  submitted_by?: number;

  @IsOptional()
  @IsEnum(['completed', 'draft', 'partial'])
  status?: SubmissionStatus;

  @IsOptional()
  @IsString()
  date_from?: string;

  @IsOptional()
  @IsString()
  date_to?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}
