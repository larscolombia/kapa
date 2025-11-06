import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { IlvReportsService } from '../services';

@Injectable()
export class IlvOwnershipGuard implements CanActivate {
  constructor(private reportsService: IlvReportsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const reportId = parseInt(request.params.id);

    if (!user || !reportId) {
      throw new ForbiddenException('Usuario o reporte no identificado');
    }

    const report = await this.reportsService.findOne(reportId);

    if (report.propietario_user_id !== user.user_id) {
      throw new ForbiddenException('Solo el propietario puede realizar esta acción');
    }

    return true;
  }
}
