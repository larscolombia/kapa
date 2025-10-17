import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  Get,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '@common/guards/local-auth.guard';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    // const isCaptchaValid = await this.authService.verifyCaptcha(
    //   req.body['recaptcha'],
    // );
    // if (!isCaptchaValid) {
    //   throw new BadRequestException('Captcha inválido');
    // }
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const token = req.headers.authorization.replace('Bearer ', '');
    const userId = await this.authService.getPayloadFromToken(token, 'userId');
    const profile = await this.authService.getProfile(userId);
    return profile;
  }

  @UseGuards(JwtAuthGuard)
  @Get('permissions')
  async getAccessPermissions(@Request() req) {
    const token = req.headers.authorization.replace('Bearer ', '');
    const role = await this.authService.getPayloadFromToken(token, 'role');
    const permissions = await this.authService.getRolePermissions(role.role_id);
    return permissions;
  }
}
