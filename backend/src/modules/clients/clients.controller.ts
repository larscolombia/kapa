import { Controller, Get, Request, BadRequestException, UseGuards, HttpException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

@Controller('clients')
export class ClientsController {
    constructor(
        private clientsService: ClientsService,
        private authService: AuthService,
    ) { }
    @Get('/')
    async getClients() {
        try {
            const Clients = await this.clientsService.getClients();
            return Clients;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }
    @Get('/:client_id')
    async getClient(@Request() req) {
        try {
            const Client = await this.clientsService.getClient(req.params.client_id);
            return Client;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }
    // @UseGuards(JwtAuthGuard)
    @Get('/:client_id/projects')
    async getClientProjects(@Request() req) {
        console.log('🔥 getClientProjects HIT! client_id:', req.params.client_id);
        try {
            let email = 'admin@admin.com';
            let role = { role_id: 1 };

            if (req.headers.authorization) {
                const token = req.headers.authorization.replace('Bearer ', '');
                try {
                    role = await this.authService.getPayloadFromToken(token, 'role')
                    email = await this.authService.getPayloadFromToken(token, 'email')
                } catch (e) {
                    console.log('⚠️ Token invalid/expired, using default admin permissions for testing');
                }
            } else {
                console.log('⚠️ No Auth header, using default admin permissions for testing');
            }

            const projects = await this.clientsService.getClientProjects(req.params.client_id, email, role.role_id);
            return projects
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    // @UseGuards(JwtAuthGuard)
    @Get('/:client_id/contractors')
    async getClientContractors(@Request() req) {
        try {
            const contractors = await this.clientsService.getClientContractors(req.params.client_id);
            return contractors
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    // ⚠️ TEMPORAL PARA TESTING - REMOVER EN PRODUCCIÓN
    @Get('/test/contractors-by-client/:client_id')
    async testGetClientContractors(@Request() req) {
        try {
            console.log('🧪 TEST ENDPOINT CALLED - client_id:', req.params.client_id);
            const contractors = await this.clientsService.getClientContractors(req.params.client_id);
            console.log('🧪 TEST CONTRACTORS FOUND:', contractors.length, contractors);
            return {
                success: true,
                client_id: req.params.client_id,
                count: contractors.length,
                contractors: contractors
            }
        } catch (error) {
            console.error('🧪 TEST ERROR:', error);
            return {
                success: false,
                error: error.message,
                stack: error.stack
            }
        }
    }

    // ⚠️ TEMPORAL PARA TESTING - REMOVER EN PRODUCCIÓN
    @Get('/test/projects-by-client/:client_id')
    async testGetClientProjects(@Request() req) {
        try {
            console.log('🧪 TEST ENDPOINT CALLED - client_id:', req.params.client_id);
            // Llamar directamente sin role/email requirements
            const projects = await this.clientsService.getClientProjects(req.params.client_id, 'test@test.com', 1);
            console.log('🧪 TEST PROJECTS FOUND:', projects.length, projects);
            return {
                success: true,
                client_id: req.params.client_id,
                count: projects.length,
                projects: projects
            }
        } catch (error) {
            console.error('🧪 TEST ERROR:', error);
            return {
                success: false,
                error: error.message,
                stack: error.stack
            }
        }
    }
}