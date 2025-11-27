import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { IlvReport } from '../../database/entities/ilv-report.entity';
import { IlvReportField } from '../../database/entities/ilv-report-field.entity';
import { IlvAttachment } from '../../database/entities/ilv-attachment.entity';
import { IlvCloseToken } from '../../database/entities/ilv-close-token.entity';
import { IlvMaestro } from '../../database/entities/ilv-maestro.entity';
import { IlvAudit } from '../../database/entities/ilv-audit.entity';
import { IlvEmailLog } from '../../database/entities/ilv-email-log.entity';
import { Client } from '../../database/entities/client.entity';
import { User } from '../../database/entities/user.entity';

import {
  IlvAuthService,
  IlvNotificationsService,
  IlvReportsService,
  IlvMaestrosService,
  IlvStatsService,
  IlvAttachmentsService,
} from './services';

import { IlvSchedulerService } from './services/ilv-scheduler.service';

import {
  IlvReportsController,
  IlvCloseController,
  IlvMaestrosController,
  IlvStatsController,
  IlvAttachmentsController,
} from './controllers';

import {
  IlvTokenGuard,
  IlvOwnershipGuard,
  IlvVisibilityGuard,
} from './guards';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      IlvReport,
      IlvReportField,
      IlvAttachment,
      IlvCloseToken,
      IlvMaestro,
      IlvAudit,
      IlvEmailLog,
      Client,
      User,
    ]),
  ],
  providers: [
    IlvAuthService,
    IlvNotificationsService,
    IlvReportsService,
    IlvMaestrosService,
    IlvStatsService,
    IlvAttachmentsService,
    IlvSchedulerService,
    IlvTokenGuard,
    IlvOwnershipGuard,
    IlvVisibilityGuard,
  ],
  controllers: [
    IlvReportsController,
    IlvCloseController,
    IlvMaestrosController,
    IlvStatsController,
    IlvAttachmentsController,
  ],
  exports: [
    IlvAuthService,
    IlvReportsService,
    IlvMaestrosService,
    IlvStatsService,
  ],
})
export class IlvModule { }
