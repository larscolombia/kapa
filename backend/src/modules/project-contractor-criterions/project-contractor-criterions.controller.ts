import { Controller, Get, Request, BadRequestException, UseGuards, HttpException } from '@nestjs/common';
import { ProjectContractorCriterionsService } from './project-contractor-criterions.service';
import { AuthService } from '../auth/auth.service';
import { ProjectsService } from '../projects/projects.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ContractorsService } from '../contractors/contractors.service';

@Controller('project-contractors-criterions')
export class ProjectContractorCriterionsController {
    constructor(
        private projectContractorCriterionsService: ProjectContractorCriterionsService,
        private authService: AuthService,
    ) { }
    @Get('/')
    async getProjectContractorCriterions() {
        try {
            const ProjectContractorCriterions = await this.projectContractorCriterionsService.getProjectContractorCriterions();
            return ProjectContractorCriterions;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    @Get('/project/:project_id/contractor/:contractor_id/criterions')
    async getProjectContractorCriterionsByProjectIdAndContractorId(@Request() req) {
        try {
            const ProjectContractorCriterions = await this.projectContractorCriterionsService.getProjectContractorCriterionsByContractorIdAndProjectId(
                req.params.contractor_id,
                req.params.project_id
            );
            return ProjectContractorCriterions;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }
}
