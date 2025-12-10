import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsObject, 
  IsArray, 
  ValidateNested,
  IsNumber,
  IsEnum,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FormSchema, FormSettings } from '../../../database/entities/form-template.entity';

/**
 * DTO para crear una nueva plantilla de formulario
 */
export class CreateFormTemplateDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsObject()
  schema: FormSchema;

  @IsOptional()
  @IsObject()
  settings?: FormSettings;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  is_draft?: boolean;
}

/**
 * DTO para actualizar una plantilla de formulario
 */
export class UpdateFormTemplateDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsObject()
  schema?: FormSchema;

  @IsOptional()
  @IsObject()
  settings?: FormSettings;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  is_draft?: boolean;

  @IsOptional()
  @IsBoolean()
  increment_version?: boolean;
}

/**
 * DTO para asignar clasificaciones a un formulario
 */
export class AssignClassificationDto {
  @IsNumber()
  maestro_id: number;

  @IsOptional()
  @IsNumber()
  orden?: number;

  @IsOptional()
  @IsBoolean()
  is_required?: boolean;
}

export class AssignClassificationsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignClassificationDto)
  classifications: AssignClassificationDto[];
}

/**
 * DTO para filtrar formularios
 */
export class FilterFormTemplateDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  is_draft?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maestro_id?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}

/**
 * DTO para duplicar un formulario
 */
export class DuplicateFormTemplateDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  new_name?: string;
}
