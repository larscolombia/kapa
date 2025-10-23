import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { DocumentStateAudit } from '@entities/document-state-audit.entity';
import { Document } from '@entities/document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentStateAudit, Document])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
