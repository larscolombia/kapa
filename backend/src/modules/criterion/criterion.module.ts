import { Module } from '@nestjs/common';
import { CriterionService } from './criterion.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CriterionController } from './criterion.controller';
import { Criterion } from '@entities/criterion.entity';
import { ProjectContractorCriterionsModule } from '../project-contractor-criterions/project-contractor-criterions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Criterion])],
  providers: [CriterionService],
  exports: [CriterionService],
  controllers: [CriterionController],
})
export class CriterionsModule {}
