import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { IlvReport } from '../../../database/entities/ilv-report.entity';
import { IlvAudit } from '../../../database/entities/ilv-audit.entity';
import { SystemParameter } from '../../../database/entities/system-parameter.entity';
import { NotificationService, ReportNotificationData } from '../../../common/services/notification.service';

@Injectable()
export class IlvSchedulerService {
  private readonly logger = new Logger(IlvSchedulerService.name);
  private notificationService: NotificationService;

  constructor(
    @InjectRepository(IlvReport)
    private reportRepo: Repository<IlvReport>,
    @InjectRepository(IlvAudit)
    private auditRepo: Repository<IlvAudit>,
    @InjectRepository(SystemParameter)
    private parameterRepo: Repository<SystemParameter>,
  ) {
    this.notificationService = new NotificationService();
  }

  /**
   * Obtiene un parámetro del sistema por su key
   */
  private async getParameterValue(key: string, defaultValue: number): Promise<number> {
    try {
      const param = await this.parameterRepo.findOne({ where: { key } });
      if (param) {
        return parseFloat(param.value) || defaultValue;
      }
    } catch (error) {
      this.logger.warn(`⚠️ Error obteniendo parámetro ${key}, usando valor por defecto: ${defaultValue}`);
    }
    return defaultValue;
  }

  /**
   * Verifica si los recordatorios están habilitados
   */
  private async isReminderEnabled(): Promise<boolean> {
    try {
      const param = await this.parameterRepo.findOne({ where: { key: 'notification_reminder_enabled' } });
      return param ? param.value === 'true' : true;
    } catch {
      return true;
    }
  }

  /**
   * Job que se ejecuta diariamente a las 8:00 AM
   * Verifica reportes abiertos con más de N días (configurable) y envía notificaciones
   */
  @Cron('0 8 * * *', {
    name: 'check-sla-vencido-ilv',
    timeZone: 'America/Bogota',
  })
  async checkSlaVencido() {
    this.logger.log('🔔 Iniciando verificación de SLA vencido para ILV...');

    try {
      // Verificar si los recordatorios están habilitados
      const reminderEnabled = await this.isReminderEnabled();
      if (!reminderEnabled) {
        this.logger.log('⏸️ Recordatorios deshabilitados. Saltando verificación.');
        return;
      }

      // Obtener días de SLA desde parámetros (default: 5)
      const slaDays = await this.getParameterValue('sla_days_ilv', 5);
      this.logger.log(`📋 SLA configurado: ${slaDays} días`);

      // Calcular fecha límite
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - slaDays);

      // Query: reportes abiertos creados hace más de N días
      const reportesVencidos = await this.reportRepo.find({
        where: {
          estado: 'abierto',
          creado_en: LessThan(fechaLimite),
        },
        relations: ['project', 'client', 'contractor', 'contractor.emails', 'created_by', 'owner'],
      });

      this.logger.log(`📋 Encontrados ${reportesVencidos.length} reportes ILV con SLA vencido (>${slaDays} días)`);

      let notificacionesEnviadas = 0;

      for (const reporte of reportesVencidos) {
        // Calcular días abierto
        const diasAbierto = Math.floor((Date.now() - reporte.creado_en.getTime()) / (1000 * 60 * 60 * 24));

        // Verificar si ya fue notificado hoy (últimas 23h para margen)
        const yaNotificado = await this.auditRepo.findOne({
          where: {
            entidad: 'ilv_report',
            entidad_id: reporte.report_id,
            accion: 'sla_reminder_sent',
          },
          order: { created_at: 'DESC' },
        });

        if (yaNotificado) {
          const hace23h = new Date();
          hace23h.setHours(hace23h.getHours() - 23);
          if (yaNotificado.created_at > hace23h) {
            this.logger.debug(`⏭️ Reporte ILV #${reporte.report_id} ya fue notificado hoy`);
            continue;
          }
        }

        // Preparar datos de notificación
        const notificationData: ReportNotificationData = {
          reportId: reporte.report_id,
          reportType: reporte.tipo,
          module: 'ILV',
          action: 'reminder',
          projectName: reporte.project?.name,
          clientName: reporte.client?.name,
          contractorName: reporte.contractor?.name,
          creatorName: reporte.created_by?.name,
          creatorEmail: reporte.created_by?.email,
          ownerEmail: reporte.owner?.email,
          contractorEmails: reporte.contractor?.emails?.map(e => e.email) || [],
          daysOpen: diasAbierto,
          createdAt: reporte.creado_en,
        };

        // Enviar recordatorio
        const sent = await this.notificationService.sendSlaReminderNotification(notificationData);

        if (sent) {
          notificacionesEnviadas++;

          // Registrar auditoría
          await this.auditRepo.save(this.auditRepo.create({
            entidad: 'ilv_report',
            entidad_id: reporte.report_id,
            accion: 'sla_reminder_sent',
            diff_json: {
              tipo: reporte.tipo,
              dias_abierto: diasAbierto,
              sla_configurado: slaDays,
              proyecto: reporte.project?.name,
              destinatarios: [notificationData.creatorEmail, notificationData.ownerEmail, ...(notificationData.contractorEmails || [])].filter(Boolean),
            },
            actor_id: null,
            ip: 'system',
            user_agent: 'IlvSchedulerService',
          }));

          this.logger.log(
            `📧 Recordatorio enviado: ILV #${reporte.report_id} (${reporte.tipo}) - ` +
            `${diasAbierto} días - Proyecto: ${reporte.project?.name || 'N/A'}`
          );
        }
      }

      this.logger.log(`✅ Verificación SLA ILV completada. ${notificacionesEnviadas}/${reportesVencidos.length} recordatorios enviados.`);
    } catch (error) {
      this.logger.error('❌ Error en verificación de SLA ILV:', error);
    }
  }

  /**
   * Método manual para ejecutar el job (útil para testing)
   */
  async ejecutarManual() {
    this.logger.log('🔧 Ejecución manual del job SLA ILV...');
    await this.checkSlaVencido();
  }
}
