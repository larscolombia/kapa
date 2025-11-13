import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ContractorsModule } from './modules/contractors/contractors.module';
import { CriterionsModule } from './modules/criterion/criterion.module';
import { SubCriterionsModule } from './modules/subcriterion/subcriterion.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { ProjectContractorsModule } from './modules/project-contractors/project-contractors.module';
import { ProjectContractorCriterionsModule } from './modules/project-contractor-criterions/project-contractor-criterions.module';
import { SupportsModule } from './modules/supports/supports.module';
import { ReportsModule } from './modules/reports/reports.module';
import { IlvModule } from './modules/ilv/ilv.module';
import { TestUploadController } from './test-upload.controller';
import { DebugInterceptor } from './common/interceptors/debug.interceptor';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    RolesModule,
    ProjectsModule,
    ClientsModule,
    ContractorsModule,
    CriterionsModule,
    SubCriterionsModule,
    DocumentsModule,
    EmployeesModule,
    ProjectContractorsModule,
    ProjectContractorCriterionsModule,
    SupportsModule,
    ReportsModule,
    IlvModule,
  ],
  controllers: [AppController, TestUploadController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: DebugInterceptor,
    },
  ],
})
export class AppModule { }
