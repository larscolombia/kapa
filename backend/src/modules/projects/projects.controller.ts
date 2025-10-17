import {
    Controller,
    Get,
    Request,
    BadRequestException,
    HttpException,
    Body,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';

@Controller('projects')
export class ProjectsController {
    constructor(private projectsService: ProjectsService, private authService: AuthService) { }
    @Get('/')
    async getProjects() {
        try {
            const projects = await this.projectsService.getProjects();
            return projects;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    @Get('/:id')
    async getProject(@Request() req) {
        try {
            const project = await this.projectsService.getProject(req.params.id);
            return project;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    @Post('/')
    async postProjects(@Body() projectData) {
        try {
            const projects = await this.projectsService.create(projectData);
            return projects;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    @Put('/')
    async PutProjects(@Body() projectData) {
        try {
            const projects = await this.projectsService.update(projectData);
            return projects;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:project_id/contractors')
    async getProjectContractors(@Request() req) {
        try {
            const token = req.headers.authorization.replace('Bearer ', '');
            const role = await this.authService.getPayloadFromToken(token, 'role')
            const email = await this.authService.getPayloadFromToken(token, 'email')
            const projects = await this.projectsService.getProjectContractors(req.params.project_id, email, role.role_id);
            return projects
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }
}
