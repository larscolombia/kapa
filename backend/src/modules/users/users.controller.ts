import { Controller, Get, Request, Post, Body, BadRequestException, Put, HttpException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService, private authService: AuthService) { }

    @Post('user-forgot-password')
    async forgotPassword(@Body('email') email: string) {
        await this.usersService.createPasswordResetToken(email);
        return { message: 'Si el correo está registrado, recibirás un email para restablecer la contraseña.' };
    }

    @Put('restore-password')
    async resetPassword(@Body('token') token: string, @Body('newPassword') newPassword: string) {
        try {
            await this.usersService.resetPassword(token, newPassword);
            return { message: 'Contraseña restablecida con éxito.' };
        } catch (error) {
            throw new BadRequestException('Token inválido o expirado');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Put('change-password')
    async changePassword(@Request() req, @Body('newPassword') newPassword: string) {
        try {
            const token = req.headers.authorization.replace('Bearer ', '');
            const userId = await this.authService.getPayloadFromToken(token, 'userId')
            await this.usersService.changePassword(userId, newPassword);
            return { message: 'Contraseña actualizada con éxito.' };
        } catch (error) {
            throw new BadRequestException('Token inválido o expirado');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('/')
    async getUsers() {
        try {
            const users = await this.usersService.getUsersWithoutPassword();
            return users;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async getUser(@Request() req) {
        try {
            const user = await this.usersService.getUserWithoutPassword(req.params.id);
            return user;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/')
    async postUsers(@Body() userData) {
        try {
            const users = await this.usersService.create(userData);
            return users;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    @UseGuards(JwtAuthGuard)
    @Put('/')
    async PutUsers(@Body() userData) {
        try {
            const users = await this.usersService.update(userData);
            return users;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }


    @Post('/getKapaEmails')
    async getKapaEmails() {
      try {
        const Documents = await this.usersService.getKapaEmails();
        return Documents;
      } catch (error) {
        console.log(error);
        throw new BadRequestException('Error al obtener los documentitos');
      }
    }
}
