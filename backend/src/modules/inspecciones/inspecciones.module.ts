import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InspeccionReport } from '../../database/entities/inspeccion-report.entity';
import { InspeccionReportField } from '../../database/entities/inspeccion-report-field.entity';
import { InspeccionMaestro } from '../../database/entities/inspeccion-maestro.entity';
import { InspeccionAttachment } from '../../database/entities/inspeccion-attachment.entity';
import { InspeccionesReportsService } from './services/inspecciones-reports.service';
import { InspeccionesAttachmentsService } from './services/inspecciones-attachments.service';
import { InspeccionesController } from './controllers/inspecciones.controller';
import { InspeccionesAttachmentsController } from './controllers/inspecciones-attachments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InspeccionReport,
      InspeccionReportField,
      InspeccionMaestro,
      InspeccionAttachment,
    ]),
  ],
  providers: [
    InspeccionesReportsService,
    InspeccionesAttachmentsService,
  ],
  controllers: [
    InspeccionesController,
    InspeccionesAttachmentsController,
  ],
  exports: [
    InspeccionesReportsService,
    InspeccionesAttachmentsService,
  ],
})
export class InspeccionesModule {}
