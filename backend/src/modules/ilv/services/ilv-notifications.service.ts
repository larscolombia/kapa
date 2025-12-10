import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IlvEmailLog } from '../../../database/entities/ilv-email-log.entity';
import { IlvReport } from '../../../database/entities/ilv-report.entity';
import { NotificationService, ReportNotificationData } from '../../../common/services/notification.service';

@Injectable()
export class IlvNotificationsService {
  private readonly logger = new Logger(IlvNotificationsService.name);
  private notificationService: NotificationService;

  constructor(
    @InjectRepository(IlvEmailLog)
    private emailLogRepo: Repository<IlvEmailLog>,
  ) {
    this.notificationService = new NotificationService();
  }

  /**
   * Envía notificación cuando se crea un reporte ILV
   */
  async sendReportCreatedEmail(
    report: IlvReport,
    closeToken: string,
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'https://kapa.healtheworld.com.co';
    const closeLink = `${frontendUrl}/ilv/close?rid=${report.report_id}&t=${closeToken}`;

    // Construir datos de notificación
    const notificationData: ReportNotificationData = {
      reportId: report.report_id,
      reportType: report.tipo,
      module: 'ILV',
      action: 'created',
      projectName: report.project?.name,
      clientName: report.client?.name,
      contractorName: report.contractor?.name,
      creatorName: report.created_by?.name,
      creatorEmail: report.created_by?.email,
      ownerEmail: report.owner?.email,
      contractorEmails: report.contractor?.emails?.map(e => e.email) || [],
      additionalData: { closeLink },
    };

    // Guardar log en BD
    const emailLog = this.emailLogRepo.create({
      report_id: report.report_id,
      to_addr: notificationData.creatorEmail || 'N/A',
      subject: `[KAPA] NUEVO: ILV - ${report.tipo} #${report.report_id}`,
      payload: JSON.stringify({ report: { report_id: report.report_id, tipo: report.tipo }, closeLink }),
      status: 'pending',
    });

    try {
      // Enviar correo real
      const sent = await this.notificationService.sendReportCreatedNotification(notificationData);
      
      emailLog.status = sent ? 'sent' : 'failed';
      emailLog.sent_at = sent ? new Date() : null;
      
      if (sent) {
        this.logger.log(`✅ Email enviado para reporte ILV #${report.report_id} (creado)`);
      } else {
        emailLog.error_message = 'No recipients available';
        this.logger.warn(`⚠️ No se pudo enviar email para reporte #${report.report_id}: sin destinatarios`);
      }
    } catch (error) {
      emailLog.status = 'failed';
      emailLog.error_message = error.message || 'Unknown error';
      this.logger.error(`❌ Error enviando email para reporte #${report.report_id}:`, error);
    }

    await this.emailLogRepo.save(emailLog);
  }

  /**
   * Envía notificación cuando se cierra un reporte ILV
   */
  async sendReportClosedEmail(report: IlvReport): Promise<void> {
    // Construir datos de notificación
    const notificationData: ReportNotificationData = {
      reportId: report.report_id,
      reportType: report.tipo,
      module: 'ILV',
      action: 'closed',
      projectName: report.project?.name,
      clientName: report.client?.name,
      contractorName: report.contractor?.name,
      creatorName: report.created_by?.name,
      creatorEmail: report.created_by?.email,
      ownerEmail: report.owner?.email,
      contractorEmails: report.contractor?.emails?.map(e => e.email) || [],
    };

    // Guardar log en BD
    const emailLog = this.emailLogRepo.create({
      report_id: report.report_id,
      to_addr: notificationData.creatorEmail || 'N/A',
      subject: `[KAPA] CERRADO: ILV - ${report.tipo} #${report.report_id}`,
      payload: JSON.stringify({ report: { report_id: report.report_id, tipo: report.tipo, estado: 'cerrado' } }),
      status: 'pending',
    });

    try {
      // Enviar correo real
      const sent = await this.notificationService.sendReportClosedNotification(notificationData);
      
      emailLog.status = sent ? 'sent' : 'failed';
      emailLog.sent_at = sent ? new Date() : null;
      
      if (sent) {
        this.logger.log(`✅ Email enviado para reporte ILV #${report.report_id} (cerrado)`);
      } else {
        emailLog.error_message = 'No recipients available';
        this.logger.warn(`⚠️ No se pudo enviar email para reporte #${report.report_id}: sin destinatarios`);
      }
    } catch (error) {
      emailLog.status = 'failed';
      emailLog.error_message = error.message || 'Unknown error';
      this.logger.error(`❌ Error enviando email para reporte #${report.report_id}:`, error);
    }

    await this.emailLogRepo.save(emailLog);
  }
}
