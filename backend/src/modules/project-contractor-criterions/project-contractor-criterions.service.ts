import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectContractorCriterion } from '@entities/project-contractor-criterion.entity';
import { CriterionService } from '../criterion/criterion.service';

@Injectable()
export class ProjectContractorCriterionsService {
    constructor(
        @InjectRepository(ProjectContractorCriterion)
        private projectContractorCriterionRepository: Repository<ProjectContractorCriterion>,
        private criterionService: CriterionService
    ) { }
    async getProjectContractorCriterions(): Promise<ProjectContractorCriterion[] | undefined> {
        return this.projectContractorCriterionRepository.find();
    }

    async getCompletionPercentage(projectId: number, contractorId: number, criterionId: number): Promise<number | null> {
        const result = await this.projectContractorCriterionRepository.createQueryBuilder('projectContractorCriterion')
            .innerJoin('projectContractorCriterion.projectContractor', 'projectContractor')
            .where('projectContractor.project = :projectId', { projectId })
            .andWhere('projectContractor.contractor = :contractorId', { contractorId })
            .andWhere('projectContractorCriterion.criterion_id = :criterionId', { criterionId })
            .select('projectContractorCriterion.completion_percentage')
            .getOne();

        return result ? result.completion_percentage : 0;
    }

    async getProjectContractorCriterionsByContractorIdAndProjectId(contractorId: number, projectId: number): Promise<any[] | undefined> {
        const criterions = await this.criterionService.getCriterionsByProjectIdAndContractorID(projectId, contractorId);
        if (criterions.length === 0) throw new NotFoundException('No existen criterios parametrizados');
        const criterionsDto = await Promise.all(criterions.map(async (criterion) => {
            const approvalPercentage = await this.getCompletionPercentage(
                projectId,
                contractorId,
                criterion.criterion_id
            );

            return {
                ...criterion,
                approvalPercentage: approvalPercentage,
                projectContractorCriterions: undefined
            };
        }));
        return criterionsDto;
    }

    async createOrUpdate(projectContractorId: number, criterionId: number, completionPercentage: number): Promise<ProjectContractorCriterion> {
        const projectContractorCriterion = await this.projectContractorCriterionRepository.findOneBy({ projectContractor: { project_contractor_id: projectContractorId }, criterion: { criterion_id: criterionId } });
        if (projectContractorCriterion) {
            projectContractorCriterion.completion_percentage = completionPercentage;
            return this.projectContractorCriterionRepository.save(projectContractorCriterion);
        } else {
            return this.projectContractorCriterionRepository.save({
                projectContractor: { project_contractor_id: projectContractorId },
                criterion: { criterion_id: criterionId },
                completion_percentage: completionPercentage,
            });
        }
    }
}