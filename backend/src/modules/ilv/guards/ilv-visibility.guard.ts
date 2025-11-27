import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IlvReport } from '../../../database/entities/ilv-report.entity';

@Injectable()
export class IlvVisibilityGuard implements CanActivate {
  constructor(
    @InjectRepository(IlvReport)
    private reportRepo: Repository<IlvReport>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const reportId = request.params.id;

    if (!reportId || !user) {
      return true; // Dejar que otros guards manejen
    }

    const report = await this.reportRepo.findOne({
      where: { report_id: parseInt(reportId) },
      relations: ['project', 'client']
    });

    if (!report) {
      return false;
    }

    // Admin KAPA y Usuario KAPA: ven todos los reportes de sus clientes asociados
    if (user.role?.name === 'Administrador' || user.role?.name === 'Usuario KAPA') {
      // TODO: Implementar lógica de clientes asociados al usuario
      // Por ahora permitir todo para admin
      return true;
    }

    // Cliente: solo reportes de SU cliente
    if (user.role?.name === 'Cliente') {
      // TODO: Obtener cliente_id del usuario y comparar
      return report.cliente_id === user.cliente_id;
    }

    // Contratista/Subcontratista: solo reportes donde participan
    if (user.role?.name === 'Contratista' || user.role?.name === 'Subcontratista') {
      // TODO: Verificar que el usuario participe en el proyecto
      return report.empresa_id === user.empresa_id;
    }

    return false;
  }
}
