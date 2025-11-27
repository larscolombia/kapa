import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../database/entities/user.entity';
import { IlvReportsService } from '../services';

@Injectable()
export class IlvOwnershipGuard implements CanActivate {
  constructor(
    private reportsService: IlvReportsService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const reportId = parseInt(request.params.id);

    if (!user || !reportId) {
      throw new ForbiddenException('Usuario o reporte no identificado');
    }

    const report = await this.reportsService.findOne(reportId);

    // Obtener información del usuario para verificar si es admin
    const fullUser = await this.userRepo.findOne({
      where: { user_id: user.user_id },
      relations: ['role'],
    });

    // Permitir edición si es admin o propietario
    const isAdmin = fullUser?.role?.name === 'Administrador';
    const isOwner = report.propietario_user_id === user.user_id;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Solo el propietario o un administrador pueden realizar esta acción');
    }

    return true;
  }
}
