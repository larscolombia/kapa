import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subcriterion } from '@entities/subcriterion.entity';

@Injectable()
export class SubCriterionService {
  constructor(
    @InjectRepository(Subcriterion)
    private subcriterionRepository: Repository<Subcriterion>,
  ) {}
  async getSubCriterions(): Promise<Subcriterion[] | undefined> {
    return this.subcriterionRepository.find({
      relations: ['criterion'],
    });
  }
  async getSubCriterionsByCriterionId(
    criterion_id: number,
  ): Promise<Subcriterion[] | undefined> {
    return this.subcriterionRepository.find({
      where: { criterion: { criterion_id } },
      relations: ['criterion'],
      order: { order: 'ASC' },
    });
  }
  async getSubCriterionsWithEmployeeRequired(): Promise<
    Subcriterion[] | undefined
  > {
    return this.subcriterionRepository.find({
      where: { employee_required: true },
      relations: ['criterion', 'criterion.documentType'],
      order: { order: 'ASC' },
    });
  }
}
