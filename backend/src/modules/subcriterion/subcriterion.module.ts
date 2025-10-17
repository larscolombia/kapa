import { Module } from '@nestjs/common';
import { SubCriterionService } from './subcriterion.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubCriterionController } from './subcriterion.controller';
import { Subcriterion } from '@entities/subcriterion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subcriterion])],
  providers: [SubCriterionService],
  exports: [SubCriterionService],
  controllers: [SubCriterionController],
})
export class SubCriterionsModule {}
