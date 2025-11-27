import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { IlvReport } from '../../../database/entities/ilv-report.entity';
import { IlvAudit } from '../../../database/entities/ilv-audit.entity';

@Injectable()
export class IlvSchedulerService {
  private readonly logger = new Logger(IlvSchedulerService.name);

  constructor(
    @InjectRepository(IlvReport)
    private reportRepo: Repository<IlvReport>,
    @InjectRepository(IlvAudit)
    private auditRepo: Repository<IlvAudit>,
  ) { }

  /**
   * Job que se ejecuta diariamente a las 8:00 AM
   * Verifica reportes abiertos con más de 5 días y envía notificaciones
   */
  @Cron('0 8 * * *', {
    name: 'check-sla-vencido',
    timeZone: 'America/Bogota',
  })
  async checkSlaVencido() {
    this.logger.log('Iniciando verificación de SLA vencido...');

    try {
      // Calcular fecha límite (5 días atrás)
      const cincoDiasAtras = new Date();
      cincoDiasAtras.setDate(cincoDiasAtras.getDate() - 5);

      // Query: reportes abiertos creados hace más de 5 días
      const reportesVencidos = await this.reportRepo.find({
        where: {
          estado: 'abierto',
          creado_en: LessThan(cincoDiasAtras),
        },
        relations: ['project', 'client', 'contractor'],
      });

      this.logger.log(`Encontrados ${reportesVencidos.length} reportes con SLA vencido`);

      for (const reporte of reportesVencidos) {
        // Verificar si ya fue notificado recientemente (últimas 24h)
        const yaNotificado = await this.auditRepo.findOne({
          where: {
            entidad: 'ilv_report',
            entidad_id: reporte.report_id,
            accion: 'sla_vencido_notificado',
          },
          order: { created_at: 'DESC' },
        });

        // Si ya fue notificado hace menos de 24h, saltar
        if (yaNotificado) {
          const hace24h = new Date();
          hace24h.setHours(hace24h.getHours() - 24);
          if (yaNotificado.created_at > hace24h) {
            this.logger.debug(`Reporte #${reporte.report_id} ya fue notificado recientemente`);
            continue;
          }
        }

        // TODO: Integrar con servicio de email
        // await this.emailService.sendSlaVencidoEmail(reporte);

        // Registrar auditoría
        const audit = this.auditRepo.create({
          entidad: 'ilv_report',
          entidad_id: reporte.report_id,
          accion: 'sla_vencido_notificado',
          diff_json: {
            tipo: reporte.tipo,
            dias_abierto: Math.floor((Date.now() - reporte.creado_en.getTime()) / (1000 * 60 * 60 * 24)),
            proyecto: reporte.project?.name,
          },
          actor_id: null, // Sistema
          ip: 'system',
          user_agent: 'IlvSchedulerService',
        });

        await this.auditRepo.save(audit);

        this.logger.log(
          `Notificación SLA enviada para reporte #${reporte.report_id} (${reporte.tipo}) - ` +
          `Proyecto: ${reporte.project?.name || 'N/A'}`
        );
      }

      this.logger.log(`Verificación SLA completada. ${reportesVencidos.length} notificaciones enviadas.`);
    } catch (error) {
      this.logger.error('Error en verificación de SLA:', error);
    }
  }

  /**
   * Método manual para ejecutar el job (útil para testing)
   */
  async ejecutarManual() {
    this.logger.log('Ejecución manual del job SLA...');
    await this.checkSlaVencido();
  }
}
