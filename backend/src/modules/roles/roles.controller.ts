import { Controller, Get, BadRequestException } from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
    constructor(private RolesService: RolesService) { }
    @Get('/')
    async getRoles() {
        try {
            const Roles = await this.RolesService.getRoles();
            return Roles;
        } catch (error) {
            throw new BadRequestException('Error al obtener los usuarios');
        }
    }
}
