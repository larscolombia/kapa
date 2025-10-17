import { Module } from '@nestjs/common';
import { DocumentService } from './documents.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentController } from './documents.controller';
import { Document } from '@entities/document.entity';
import { Subcriterion } from '@entities/subcriterion.entity';
import { ProjectContractorCriterionsModule } from '../project-contractor-criterions/project-contractor-criterions.module';
import { ProjectContractorsModule } from '../project-contractors/project-contractors.module';
import { Employee } from '@entities/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document, Subcriterion, Employee]), ProjectContractorCriterionsModule, ProjectContractorsModule],
  providers: [DocumentService],
  exports: [DocumentService],
  controllers: [DocumentController],
})
export class DocumentsModule {}
