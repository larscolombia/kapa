import { Module } from '@nestjs/common';
import { ContractorsService } from './contractors.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contractor } from '@entities/contractor.entity';
import { ContractorsController } from './contractors.controller';
import { ContractorEmail } from '@entities/contractor-email.entity';
import { ProjectContractor } from '@entities/project-contractor.entity';
import { Project } from '@entities/project.entity';
import { ProjectContractorsModule } from '../project-contractors/project-contractors.module';
import { ProjectContractorCriterionsModule } from '../project-contractor-criterions/project-contractor-criterions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Contractor, ContractorEmail, Project, ProjectContractor]), ProjectContractorsModule, ProjectContractorCriterionsModule],
  providers: [ContractorsService],
  exports: [ContractorsService],
  controllers: [ContractorsController],
})
export class ContractorsModule { }
