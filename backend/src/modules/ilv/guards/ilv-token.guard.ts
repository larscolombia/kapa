import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { IlbAuthService } from '../services';

@Injectable()
export class IlbTokenGuard implements CanActivate {
  constructor(private authService: IlbAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.query.t || request.body.token;

    if (!token) {
      throw new UnauthorizedException('Token requerido');
    }

    try {
      const payload = await this.authService.verifyCloseToken(token);
      request.ilvToken = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Token inválido');
    }
  }
}
