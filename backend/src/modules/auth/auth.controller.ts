import { Controller, Post, Body, BadRequestException, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    
    if (!user) {
      throw new BadRequestException('Credenciales inválidas');
    }
    
    if (user.state === 'inactive') {
      throw new BadRequestException('Tu cuenta esta inactiva, por favor contacta con el administrador');
    }
    
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('permissions')
  async getPermissions(@Request() req) {
    return this.authService.getRolePermissions(req.user.role.role_id);
  }

  // ... otros endpoints como refresh, restore-password, etc.
}
