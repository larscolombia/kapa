import { Module } from '@nestjs/common';
import { ProjectContractorsService } from './project-contractors.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectContractorsController } from './project-contractors.controller';
import { ProjectContractor } from '@entities/project-contractor.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectContractor]), AuthModule],
  providers: [ProjectContractorsService],
  exports: [ProjectContractorsService],
  controllers: [ProjectContractorsController],
})
export class ProjectContractorsModule {}
