import { IsString, IsBoolean, IsInt, IsOptional } from 'class-validator';

export class CreateMaestroDto {
  @IsString()
  tipo: string;

  @IsString()
  clave: string;

  @IsString()
  valor: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean = true;

  @IsOptional()
  @IsInt()
  orden?: number = 0;

  @IsOptional()
  @IsString()
  aplica_a_tipo?: string;
}
