import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IlbReportFieldDto } from './create-ilv-report.dto';

export class UpdateIlbReportDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IlbReportFieldDto)
  fields?: IlbReportFieldDto[];
}
