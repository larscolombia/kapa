import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { InspeccionReport } from '../../database/entities/inspeccion-report.entity';
import { InspeccionReportField } from '../../database/entities/inspeccion-report-field.entity';
import { InspeccionMaestro } from '../../database/entities/inspeccion-maestro.entity';
import { InspeccionAttachment } from '../../database/entities/inspeccion-attachment.entity';
import { SystemParameter } from '../../database/entities/system-parameter.entity';
import { InspeccionesReportsService } from './services/inspecciones-reports.service';
import { InspeccionesAttachmentsService } from './services/inspecciones-attachments.service';
import { InspeccionesNotificationsService } from './services/inspecciones-notifications.service';
import { InspeccionesSchedulerService } from './services/inspecciones-scheduler.service';
import { InspeccionesStatsService } from './services/inspecciones-stats.service';
import { InspeccionesController } from './controllers/inspecciones.controller';
import { InspeccionesAttachmentsController } from './controllers/inspecciones-attachments.controller';
import { InspeccionesStatsController } from './controllers/inspecciones-stats.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      InspeccionReport,
      InspeccionReportField,
      InspeccionMaestro,
      InspeccionAttachment,
      SystemParameter,
    ]),
  ],
  providers: [
    InspeccionesReportsService,
    InspeccionesAttachmentsService,
    InspeccionesNotificationsService,
    InspeccionesSchedulerService,
    InspeccionesStatsService,
  ],
  controllers: [
    InspeccionesController,
    InspeccionesAttachmentsController,
    InspeccionesStatsController,
  ],
  exports: [
    InspeccionesReportsService,
    InspeccionesAttachmentsService,
    InspeccionesNotificationsService,
    InspeccionesSchedulerService,
    InspeccionesStatsService,
  ],
})
export class InspeccionesModule {}
