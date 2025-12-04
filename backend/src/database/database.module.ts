import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Client } from './entities/client.entity';
import { Project } from './entities/project.entity';
import { Contractor } from './entities/contractor.entity';
import { Criterion } from './entities/criterion.entity';
import { Subcriterion } from './entities/subcriterion.entity';
import { ProjectContractor } from './entities/project-contractor.entity';
import { ProjectContractorCriterion } from './entities/project-contractor-criterion.entity';
import { DocumentType } from './entities/document-type.entity';
import { Employee } from './entities/employee.entity';
import { ContractorEmail } from './entities/contractor-email.entity';
import { IlvReport } from './entities/ilv-report.entity';
import { IlvReportField } from './entities/ilv-report-field.entity';
import { IlvCloseToken } from './entities/ilv-close-token.entity';
import { IlvEmailLog } from './entities/ilv-email-log.entity';
import { IlvMaestro } from './entities/ilv-maestro.entity';
import { IlvAudit } from './entities/ilv-audit.entity';
import { IlvAttachment } from './entities/ilv-attachment.entity';
import { Access } from './entities/access.entity';
import { Document } from './entities/document.entity';
import { DocumentStateAudit } from './entities/document-state-audit.entity';
import { SupportFile } from './entities/support-file.entity';
import { InspeccionReport } from './entities/inspeccion-report.entity';
import { InspeccionReportField } from './entities/inspeccion-report-field.entity';
import { InspeccionMaestro } from './entities/inspeccion-maestro.entity';
import { InspeccionAttachment } from './entities/inspeccion-attachment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [
          User,
          Role,
          Client,
          Project,
          Contractor,
          Criterion,
          Subcriterion,
          ProjectContractor,
          ProjectContractorCriterion,
          DocumentType,
          Employee,
          ContractorEmail,
          IlvReport,
          IlvReportField,
          IlvCloseToken,
          IlvEmailLog,
          IlvMaestro,
          IlvAudit,
          IlvAttachment,
          Access,
          Document,
          DocumentStateAudit,
          SupportFile,
          InspeccionReport,
          InspeccionReportField,
          InspeccionMaestro,
          InspeccionAttachment,
        ],
        synchronize: true, // Solo para desarrollo; no se recomienda en producción
      }),
    }),
  ],
})
export class DatabaseModule { }
