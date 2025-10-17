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
    @UseGuards(JwtAuthGuard)
    @Get('/:client_id/projects')
    async getClientProjects(@Request() req) {
        try {
            const token = req.headers.authorization.replace('Bearer ', '');
            const role = await this.authService.getPayloadFromToken(token, 'role')
            const email = await this.authService.getPayloadFromToken(token, 'email')
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
}