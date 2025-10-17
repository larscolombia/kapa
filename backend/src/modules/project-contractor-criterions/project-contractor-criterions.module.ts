import { Module } from '@nestjs/common';
import { ProjectContractorCriterionsService } from './project-contractor-criterions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectContractorCriterionsController } from './project-contractor-criterions.controller';
import { ProjectContractorCriterion } from '@entities/project-contractor-criterion.entity';
import { AuthModule } from '../auth/auth.module';
import { CriterionsModule } from '../criterion/criterion.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectContractorCriterion]), AuthModule, CriterionsModule],
  providers: [ProjectContractorCriterionsService],
  exports: [ProjectContractorCriterionsService],
  controllers: [ProjectContractorCriterionsController],
})
export class ProjectContractorCriterionsModule {}
