import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IlbReport } from '../../database/entities/ilv-report.entity';
import { IlbReportField } from '../../database/entities/ilv-report-field.entity';
import { IlbAttachment } from '../../database/entities/ilv-attachment.entity';
import { IlbCloseToken } from '../../database/entities/ilv-close-token.entity';
import { IlbMaestro } from '../../database/entities/ilv-maestro.entity';
import { IlbAudit } from '../../database/entities/ilv-audit.entity';
import { IlbEmailLog } from '../../database/entities/ilv-email-log.entity';

import {
  IlbAuthService,
  IlbNotificationsService,
  IlbReportsService,
  IlbMaestrosService,
} from './services';

import {
  IlbReportsController,
  IlbCloseController,
  IlbMaestrosController,
} from './controllers';

import {
  IlbTokenGuard,
  IlbOwnershipGuard,
} from './guards';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IlbReport,
      IlbReportField,
      IlbAttachment,
      IlbCloseToken,
      IlbMaestro,
      IlbAudit,
      IlbEmailLog,
    ]),
  ],
  providers: [
    IlbAuthService,
    IlbNotificationsService,
    IlbReportsService,
    IlbMaestrosService,
    IlbTokenGuard,
    IlbOwnershipGuard,
  ],
  controllers: [
    IlbReportsController,
    IlbCloseController,
    IlbMaestrosController,
  ],
  exports: [
    IlbAuthService,
    IlbReportsService,
    IlbMaestrosService,
  ],
})
export class IlbModule {}
