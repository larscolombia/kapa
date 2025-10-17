import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Project } from '@entities/project.entity';
import { ContractorsService } from '../contractors/contractors.service';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private projectsRepository: Repository<Project>,
        private contractorsService: ContractorsService
    ) { }

    async create(projectData: Project): Promise<Project> {
        await this.validateProjectRequiredFields(projectData);
        await this.validateStateEnum(projectData.state);
        const project = this.projectsRepository.create(projectData);
        return this.projectsRepository.save(project);
    }

    async update(projectData: Project): Promise<Project> {
        const { project_id } = projectData;
        const project = await this.projectsRepository.findOneBy({ project_id });
        if (!project) throw new NotFoundException('El proyecto no existe');
        await this.validateProjectRequiredFields(projectData, true);
        await this.validateStateEnum(projectData.state);
        project.client = projectData.client;
        const updatedProject = this.projectsRepository.merge(project, projectData);
        return this.projectsRepository.save(updatedProject);
    }

    async getProjects(): Promise<any[] | undefined> {
        const projects = await this.projectsRepository.find({
            relations: [
                'projectContractors',
                'projectContractors.contractor',
                'projectContractors.contractor.emails'
            ],
            order: { project_id: 'ASC' },
        });
        const projectDto = projects.map(project => ({
            ...project,
            projectContractors: project.projectContractors.map(pc => ({
                ...pc.contractor,
                emails: pc.contractor.emails.map(e => e.email),
                projectContractors: undefined  // Remove the projectContractors field
            }))
        }));
        return projectDto;
    }

    async getProject(projectId: number): Promise<Partial<Project> | undefined> {
        const project = await this.projectsRepository.findOneBy({
            project_id: projectId,
        });
        if (!project) throw new NotFoundException('El proyecto no existe');
        return project;
    }

    async validateProjectRequiredFields(projectData: Project, isUpdate = false) {
        if (!projectData.project_id && isUpdate)
            throw new BadRequestException(
                'El identificador del proyecto es requerido',
            );
        if (!projectData.name)
            throw new BadRequestException('El nombre del proyecto es requerido');
        if (!projectData.address)
            throw new BadRequestException('La dirección del proyecto es requerida');
        if (!projectData.supervisor)
            throw new BadRequestException('El supervisor del proyecto es requerido');
        if (!projectData.start_date)
            throw new BadRequestException(
                'La fecha de inicio del proyecto es requerida',
            );
        if (!projectData.end_date)
            throw new BadRequestException(
                'La fecha de finalización del proyecto es requerida',
            );
        if (!projectData.state)
            throw new BadRequestException('El estado del proyecto es requerido');
        if (!projectData.client)
            throw new BadRequestException('El cliente del proyecto es requerido');
    }

    async validateStateEnum(state: string): Promise<void> {
        if (!['active', 'inactive'].includes(state)) {
            throw new Error('El estado debe ser activo o inactivo');
        }
    }

    async getProjectsByClientAndContractorEmail(clientId: number, email: string): Promise<Project[] | undefined> {
        const projects = await this.projectsRepository.find({
            where: { client: { client_id: clientId }, projectContractors: { contractor: { emails: { email } } }, state: 'active' }
        });
        if (projects.length === 0) throw new NotFoundException('No existen proyectos registrados para este cliente que tengan contratistas asociados a este usuario');
        return projects;
    }

    async getProjectsByClient(clientId: number, roleId: number): Promise<Project[] | undefined> {
        const query = this.projectsRepository.createQueryBuilder('project')
            .where('project.client_id = :clientId', { clientId });
        // Si el roleId es 4, filtrar solo proyectos activos
        if (roleId === 4) {
            query.andWhere('project.state = :state', { state: 'active' });
        }
        const projects = await query.getMany();
        if (projects.length === 0) {
            throw new NotFoundException('No existen proyectos registrados para este cliente');
        }
        return projects;
    }


    async getProjectContractors(projectId: number, email: string, roleId: number): Promise<any[] | undefined> {
        if (roleId === 3 || roleId === 5) {
            // Pasa el roleId a la función para limitar los resultados
            const contractors = await this.contractorsService.getContractorsByProjectIdAndEmail(projectId, email, roleId);
            return contractors;
        } else {
            const contractors = await this.contractorsService.getContractorsByProjectId(projectId, roleId);
            return contractors;
        }
    }
}
