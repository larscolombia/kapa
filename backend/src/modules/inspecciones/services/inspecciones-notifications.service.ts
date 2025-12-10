import { Injectable, Logger } from '@nestjs/common';
import { InspeccionReport } from '../../../database/entities/inspeccion-report.entity';
import { NotificationService, ReportNotificationData } from '../../../common/services/notification.service';

@Injectable()
export class InspeccionesNotificationsService {
  private readonly logger = new Logger(InspeccionesNotificationsService.name);
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Envía notificación cuando se crea un reporte de inspección
   */
  async sendReportCreatedEmail(report: InspeccionReport): Promise<boolean> {
    const notificationData: ReportNotificationData = {
      reportId: report.report_id,
      reportType: report.tipo,
      module: 'INSPECCION',
      action: 'created',
      projectName: report.project?.name,
      clientName: report.client?.name,
      contractorName: report.contractor?.name,
      creatorName: report.created_by?.name,
      creatorEmail: report.created_by?.email,
      ownerEmail: report.owner?.email,
      contractorEmails: report.contractor?.emails?.map(e => e.email) || [],
      additionalData: {
        tipoInspeccion: report.tipo === 'tecnica' ? 'Inspección Técnica' : 'Auditoría Cruzada',
        fecha: report.fecha,
        observacion: report.observacion,
      },
    };

    try {
      const sent = await this.notificationService.sendReportCreatedNotification(notificationData);
      
      if (sent) {
        this.logger.log(`✅ Email enviado para inspección #${report.report_id} (creada)`);
      } else {
        this.logger.warn(`⚠️ No se pudo enviar email para inspección #${report.report_id}: sin destinatarios`);
      }
      
      return sent;
    } catch (error) {
      this.logger.error(`❌ Error enviando email para inspección #${report.report_id}:`, error);
      return false;
    }
  }

  /**
   * Envía notificación cuando se cierra un reporte de inspección
   */
  async sendReportClosedEmail(report: InspeccionReport): Promise<boolean> {
    const notificationData: ReportNotificationData = {
      reportId: report.report_id,
      reportType: report.tipo,
      module: 'INSPECCION',
      action: 'closed',
      projectName: report.project?.name,
      clientName: report.client?.name,
      contractorName: report.contractor?.name,
      creatorName: report.created_by?.name,
      creatorEmail: report.created_by?.email,
      ownerEmail: report.owner?.email,
      contractorEmails: report.contractor?.emails?.map(e => e.email) || [],
      additionalData: {
        tipoInspeccion: report.tipo === 'tecnica' ? 'Inspección Técnica' : 'Auditoría Cruzada',
        fechaCierre: report.fecha_cierre,
      },
    };

    try {
      const sent = await this.notificationService.sendReportClosedNotification(notificationData);
      
      if (sent) {
        this.logger.log(`✅ Email enviado para inspección #${report.report_id} (cerrada)`);
      } else {
        this.logger.warn(`⚠️ No se pudo enviar email para inspección #${report.report_id}: sin destinatarios`);
      }
      
      return sent;
    } catch (error) {
      this.logger.error(`❌ Error enviando email para inspección #${report.report_id}:`, error);
      return false;
    }
  }
}
