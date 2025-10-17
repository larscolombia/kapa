import { Controller, Get, Request, BadRequestException, UseGuards, HttpException } from '@nestjs/common';
import { ProjectContractorsService } from './project-contractors.service';
import { AuthService } from '../auth/auth.service';
import { ProjectsService } from '../projects/projects.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ContractorsService } from '../contractors/contractors.service';

@Controller('project-contractors')
export class ProjectContractorsController {
    constructor(
        private projectContractorsService: ProjectContractorsService,
        private authService: AuthService,
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
}
