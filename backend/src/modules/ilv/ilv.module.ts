import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IlvReport } from '../../database/entities/ilv-report.entity';
import { IlvReportField } from '../../database/entities/ilv-report-field.entity';
import { IlvAttachment } from '../../database/entities/ilv-attachment.entity';
import { IlvCloseToken } from '../../database/entities/ilv-close-token.entity';
import { IlvMaestro } from '../../database/entities/ilv-maestro.entity';
import { IlvAudit } from '../../database/entities/ilv-audit.entity';
import { IlvEmailLog } from '../../database/entities/ilv-email-log.entity';

import {
  IlvAuthService,
  IlvNotificationsService,
  IlvReportsService,
  IlvMaestrosService,
} from './services';

import {
  IlvReportsController,
  IlvCloseController,
  IlvMaestrosController,
} from './controllers';

import {
  IlvTokenGuard,
  IlvOwnershipGuard,
} from './guards';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IlvReport,
      IlvReportField,
      IlvAttachment,
      IlvCloseToken,
      IlvMaestro,
      IlvAudit,
      IlvEmailLog,
    ]),
  ],
  providers: [
    IlvAuthService,
    IlvNotificationsService,
    IlvReportsService,
    IlvMaestrosService,
    IlvTokenGuard,
    IlvOwnershipGuard,
  ],
  controllers: [
    IlvReportsController,
    IlvCloseController,
    IlvMaestrosController,
  ],
  exports: [
    IlvAuthService,
    IlvReportsService,
    IlvMaestrosService,
  ],
})
export class IlvModule {}
