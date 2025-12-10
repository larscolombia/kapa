import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsIn, Min } from 'class-validator';

// DTO para Centros de Trabajo (Clients)
export class CreateWorkCenterDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateWorkCenterDto {
  @IsString()
  @IsOptional()
  name?: string;
}

// DTO para Maestros ILV
export class CreateIlvMaestroDto {
  @IsString()
  @IsNotEmpty()
  @IsIn([
    'tipo_reporte_hid',
    'tipo_hallazgo',
    'categoria_hid',
    'subcategoria_hid',
    'tipo_wit_hallazgo',
    'tipo_swa_hallazgo',
    'tipo_swa',
    'tipo_tarjeta',
    'estado_reporte',
    'clasificacion_fdkar',
    'area',
    'causa',
    'severidad',
    'riesgo',
    'motivo_swa',
    'tipo_evidencia',
    'tipo_hid',
    'tipo_hse',
    'centro_trabajo'
  ])
  tipo: string;

  @IsString()
  @IsNotEmpty()
  clave: string;

  @IsString()
  @IsNotEmpty()
  valor: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsInt()
  @IsOptional()
  @Min(0)
  orden?: number;

  @IsString()
  @IsOptional()
  aplica_a_tipo?: string;
}

export class UpdateIlvMaestroDto {
  @IsString()
  @IsOptional()
  clave?: string;

  @IsString()
  @IsOptional()
  valor?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsInt()
  @IsOptional()
  @Min(0)
  orden?: number;

  @IsString()
  @IsOptional()
  aplica_a_tipo?: string;
}

// DTO para Maestros Inspecciones
export class CreateInspeccionMaestroDto {
  @IsString()
  @IsNotEmpty()
  @IsIn([
    'tipo_inspeccion_tecnica',
    'clasificacion_inspeccion',
    'area_inspeccion',
    'area_auditoria',
    'clasificacion_auditoria',
    'estado_reporte'
  ])
  tipo: string;

  @IsString()
  @IsOptional()
  clave?: string;

  @IsString()
  @IsNotEmpty()
  valor: string;

  @IsInt()
  @IsOptional()
  padre_id?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  orden?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

export class UpdateInspeccionMaestroDto {
  @IsString()
  @IsOptional()
  clave?: string;

  @IsString()
  @IsOptional()
  valor?: string;

  @IsInt()
  @IsOptional()
  padre_id?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  orden?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

// DTO para listar con filtros
export class FilterMaestrosDto {
  @IsString()
  @IsOptional()
  tipo?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsString()
  @IsOptional()
  search?: string;
}
