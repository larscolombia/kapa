import { Module } from '@nestjs/common';
import { EmployeeService } from './employees.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeController } from './employees.controller';
import { Employee } from '@entities/employee.entity';
import { Subcriterion } from '@entities/subcriterion.entity';
import { ProjectContractor } from '@entities/project-contractor.entity';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, Subcriterion, ProjectContractor]), DocumentsModule
  ],
  providers: [EmployeeService],
  exports: [EmployeeService],
  controllers: [EmployeeController],
})
export class EmployeesModule { }
