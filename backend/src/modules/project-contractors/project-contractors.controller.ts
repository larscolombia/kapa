import { Controller, Get, Request, BadRequestException, HttpException } from '@nestjs/common';
import { ProjectContractorsService } from './project-contractors.service';

@Controller('project-contractors')
export class ProjectContractorsController {
    constructor(
        private projectContractorsService: ProjectContractorsService,
    ) { }
    @Get('/')
    async getProjectContractors() {
        try {
            const ProjectContractors = await this.projectContractorsService.getProjectContractors();
            return ProjectContractors;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }
    @Get('contractor/:contractor_id/project/:project_id')
    async getProjectContractor(@Request() req) {
        try {
            const ProjectContractor = await this.projectContractorsService.getProjectContractorByContractorIdAndProjectId(req.params.contractor_id, req.params.project_id);
            return ProjectContractor;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    @Get('project/:project_id')
    async getContractorsByProject(@Request() req) {
        try {
            const projectContractors = await this.projectContractorsService.getContractorsByProject(req.params.project_id);
            // Mapear para devolver los datos del contractor con el formato esperado por el frontend
            return projectContractors.map(pc => ({
                contractor_id: pc.contractor.contractor_id,
                contractor_name: pc.contractor.name,
                name: pc.contractor.name,
                nit: pc.contractor.nit,
                state: pc.contractor.state
            }));
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }
}
