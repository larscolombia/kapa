import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { ProjectContractor } from '@entities/project-contractor.entity';

@Injectable()
export class ProjectContractorsService {
    constructor(
        @InjectRepository(ProjectContractor)
        private projectContractorRepository: Repository<ProjectContractor>
    ) { }
    async getProjectContractors(): Promise<ProjectContractor[] | undefined> {
        return this.projectContractorRepository.find();
    }

    async getProjectContractor(projectContractorId: number): Promise<ProjectContractor | undefined> {
        return this.projectContractorRepository.findOneBy({ project_contractor_id: projectContractorId });
    }

    async getProjectContractorByContractorIdAndProjectId(contractorId: number, projectId: number): Promise<ProjectContractor | undefined> {
        return this.projectContractorRepository.createQueryBuilder('projectContractor')
            .innerJoinAndSelect('projectContractor.contractor', 'contractor')
            .leftJoinAndSelect('contractor.emails', 'email')
            .innerJoinAndSelect('projectContractor.project', 'project')
            .where('contractor.contractor_id = :contractorId', { contractorId })
            .andWhere('project.project_id = :projectId', { projectId })
            .getOne();
    }

    async updateProyectContractorPercentage(projectContractorId: number, percentage: number): Promise<ProjectContractor | undefined> {
        const projectContractor = await this.projectContractorRepository.findOneBy({ project_contractor_id: projectContractorId });
        if (!projectContractor) throw new NotFoundException('El proyecto no existe');
        projectContractor.completition_percentage = percentage;
        return this.projectContractorRepository.save(projectContractor);
    }

    async getProjectContractorPercentageByContractorIdAndProjectId(contractorId: number, projectId: number): Promise<number | undefined> {
        const projectContractor = await this.getProjectContractorByContractorIdAndProjectId(contractorId, projectId);
        if (!projectContractor) throw new NotFoundException('El proyecto no existe');
        return projectContractor.completition_percentage;
    }

    async getContractorsByProject(projectId: number): Promise<ProjectContractor[]> {
        return this.projectContractorRepository.find({
            where: { project: { project_id: projectId } },
            relations: ['contractor'],
        });
    }
    async checkProjectContractorDependencies(projectContractorId: number): Promise<void> {
        const projectContractor = await this.projectContractorRepository.createQueryBuilder('pc')
            .innerJoinAndSelect('pc.project', 'project')
            .leftJoinAndSelect('pc.employees', 'employee')
            .leftJoinAndSelect('pc.documents', 'document')
            .where('pc.project_contractor_id = :projectContractorId', { projectContractorId })
            .andWhere(new Brackets(qb => {
                qb.where('employee.projectContractor IS NOT NULL')
                    .orWhere('document.projectContractor IS NOT NULL');
            }))
            .getOne();

        if (projectContractor && (projectContractor.employees.length > 0 || projectContractor.documents.length > 0)) {
            throw new Error('El contratista no puede desasociarse del proyecto (' + projectContractor.project.name + ') ya que existen documentos asociados a él.');
        }
    }
}