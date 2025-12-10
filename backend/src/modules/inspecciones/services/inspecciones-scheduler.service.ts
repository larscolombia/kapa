import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { InspeccionReport } from '../../../database/entities/inspeccion-report.entity';
import { SystemParameter } from '../../../database/entities/system-parameter.entity';
import { NotificationService, ReportNotificationData } from '../../../common/services/notification.service';

@Injectable()
export class InspeccionesSchedulerService {
  private readonly logger = new Logger(InspeccionesSchedulerService.name);
  private notificationService: NotificationService;
  
  // Almacena la última fecha de notificación por reporte (en memoria)
  // En producción podría usar una tabla de auditoría similar a ILV
  private lastNotificationMap: Map<number, Date> = new Map();

  constructor(
    @InjectRepository(InspeccionReport)
    private reportRepo: Repository<InspeccionReport>,
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
   * Verifica inspecciones abiertas con más de N días (configurable) y envía recordatorios
   */
  @Cron('0 8 * * *', {
    name: 'check-sla-vencido-inspecciones',
    timeZone: 'America/Bogota',
  })
  async checkSlaVencido() {
    this.logger.log('🔔 Iniciando verificación de SLA vencido para Inspecciones...');

    try {
      // Verificar si los recordatorios están habilitados
      const reminderEnabled = await this.isReminderEnabled();
      if (!reminderEnabled) {
        this.logger.log('⏸️ Recordatorios deshabilitados. Saltando verificación.');
        return;
      }

      // Obtener días de SLA desde parámetros (default: 5)
      const slaDays = await this.getParameterValue('sla_days_inspeccion', 5);
      this.logger.log(`📋 SLA configurado: ${slaDays} días`);

      // Calcular fecha límite
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - slaDays);

      // Query: inspecciones abiertas creadas hace más de N días
      const inspeccionesVencidas = await this.reportRepo.find({
        where: {
          estado: 'abierto',
          creado_en: LessThan(fechaLimite),
        },
        relations: ['project', 'client', 'contractor', 'contractor.emails', 'created_by', 'owner'],
      });

      this.logger.log(`📋 Encontradas ${inspeccionesVencidas.length} inspecciones con SLA vencido (>${slaDays} días)`);

      let notificacionesEnviadas = 0;

      for (const inspeccion of inspeccionesVencidas) {
        // Calcular días abierto
        const diasAbierto = Math.floor((Date.now() - inspeccion.creado_en.getTime()) / (1000 * 60 * 60 * 24));

        // Verificar si ya fue notificado hoy
        const ultimaNotificacion = this.lastNotificationMap.get(inspeccion.report_id);
        if (ultimaNotificacion) {
          const hace23h = new Date();
          hace23h.setHours(hace23h.getHours() - 23);
          if (ultimaNotificacion > hace23h) {
            this.logger.debug(`⏭️ Inspección #${inspeccion.report_id} ya fue notificada hoy`);
            continue;
          }
        }

        // Preparar datos de notificación
        const notificationData: ReportNotificationData = {
          reportId: inspeccion.report_id,
          reportType: inspeccion.tipo,
          module: 'INSPECCION',
          action: 'reminder',
          projectName: inspeccion.project?.name,
          clientName: inspeccion.client?.name,
          contractorName: inspeccion.contractor?.name,
          creatorName: inspeccion.created_by?.name,
          creatorEmail: inspeccion.created_by?.email,
          ownerEmail: inspeccion.owner?.email,
          contractorEmails: inspeccion.contractor?.emails?.map(e => e.email) || [],
          daysOpen: diasAbierto,
          createdAt: inspeccion.creado_en,
        };

        // Enviar recordatorio
        const sent = await this.notificationService.sendSlaReminderNotification(notificationData);

        if (sent) {
          notificacionesEnviadas++;
          
          // Registrar última notificación
          this.lastNotificationMap.set(inspeccion.report_id, new Date());

          this.logger.log(
            `📧 Recordatorio enviado: Inspección #${inspeccion.report_id} (${inspeccion.tipo}) - ` +
            `${diasAbierto} días - Proyecto: ${inspeccion.project?.name || 'N/A'}`
          );
        }
      }

      // Limpiar reportes cerrados del mapa
      this.cleanupNotificationMap();

      this.logger.log(`✅ Verificación SLA Inspecciones completada. ${notificacionesEnviadas}/${inspeccionesVencidas.length} recordatorios enviados.`);
    } catch (error) {
      this.logger.error('❌ Error en verificación de SLA Inspecciones:', error);
    }
  }

  /**
   * Limpia el mapa de notificaciones de reportes que ya no están abiertos
   */
  private async cleanupNotificationMap() {
    try {
      const reportIds = Array.from(this.lastNotificationMap.keys());
      if (reportIds.length === 0) return;

      const reportesAbiertos = await this.reportRepo.find({
        where: { estado: 'abierto' },
        select: ['report_id'],
      });

      const idsAbiertos = new Set(reportesAbiertos.map(r => r.report_id));
      
      for (const id of reportIds) {
        if (!idsAbiertos.has(id)) {
          this.lastNotificationMap.delete(id);
        }
      }
    } catch (error) {
      this.logger.warn('Error limpiando mapa de notificaciones:', error);
    }
  }

  /**
   * Método manual para ejecutar el job (útil para testing)
   */
  async ejecutarManual() {
    this.logger.log('🔧 Ejecución manual del job SLA Inspecciones...');
    await this.checkSlaVencido();
  }
}
