import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IlvReportFieldDto } from './create-ilv-report.dto';

export class UpdateIlvReportDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IlvReportFieldDto)
  fields?: IlvReportFieldDto[];
}
