import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '@entities/project.entity';
import { ProjectsController } from './projects.controller';
import { AuthModule } from '../auth/auth.module';
import { ContractorsModule } from '../contractors/contractors.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project]), AuthModule, ContractorsModule],
  providers: [ProjectsService],
  exports: [ProjectsService],
  controllers: [ProjectsController],
})
export class ProjectsModule { }
