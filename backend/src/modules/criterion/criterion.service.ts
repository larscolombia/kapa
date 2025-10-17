import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Criterion } from '@entities/criterion.entity';

@Injectable()
export class CriterionService {
  constructor(
    @InjectRepository(Criterion)
    private criterionRepository: Repository<Criterion>
  ) { }
  async getCriterions(): Promise<Criterion[] | undefined> {
    return this.criterionRepository.find({
      relations: ['documentType'],
    });
  }

  async getCriterionById(criterion_id: number): Promise<Criterion> {
    return this.criterionRepository.findOne({ where: { criterion_id}, relations: ['documentType'] });
  }

  async getCriterionsByProjectIdAndContractorID(projectId: number, contractorId: number): Promise<any[] | undefined> {
    const criterions = await this.criterionRepository.createQueryBuilder('criterion')
      .leftJoinAndSelect('criterion.documentType', 'documentType')
      .leftJoinAndSelect(
        'criterion.projectContractorCriterions',
        'projectContractorCriterion',
        'projectContractorCriterion.criterion_id = criterion.criterion_id'
      )
      .leftJoinAndSelect(
        'projectContractorCriterion.projectContractor',
        'projectContractor',
        'projectContractor.project = :projectId AND projectContractor.contractor = :contractorId',
        { projectId: projectId, contractorId: contractorId }
      )
      .orderBy('criterion.criterion_id', 'ASC')
      .getMany();
    return criterions;
  }
}
