import { Injectable, Logger } from '@nestjs/common';
import { MailUtil } from '../utils/mail.util';

/**
 * ============================================================
 * CONFIGURACIÓN DE MODO DE CORREOS
 * ============================================================
 * 
 * MODO TEST (actual): Los correos se envían SOLO a los emails de prueba
 * MODO PRODUCCIÓN: Los correos se envían a los destinatarios reales
 * 
 * Para cambiar a producción:
 *   1. Cambiar EMAIL_MODE a 'production'
 *   2. O establecer variable de entorno: EMAIL_MODE=production
 * ============================================================
 */
const EMAIL_MODE: 'test' | 'production' = (process.env.EMAIL_MODE as 'test' | 'production') || 'test';

// Emails de prueba - Solo estos recibirán correos en modo test
const TEST_EMAILS = [
  'paola.gil@kapasas.com',
  'jorge@blasterinformation.com',
  'ludwig.angarita@lars.net.co',
];

export interface ReportNotificationData {
  reportId: number;
  reportType: string; // 'hazard_id', 'wit', 'swa', 'fdkar', 'tecnica', 'auditoria'
  module: 'ILV' | 'INSPECCION';
  action: 'created' | 'closed' | 'reminder';
  projectName?: string;
  clientName?: string;
  contractorName?: string;
  creatorName?: string;
  creatorEmail?: string;
  ownerEmail?: string;
  contractorEmails?: string[];
  additionalData?: Record<string, any>;
  // Campos para recordatorios
  daysOpen?: number;
  createdAt?: Date;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly frontendUrl = process.env.FRONTEND_URL || 'https://kapa.healtheworld.com.co';
  private readonly emailMode = EMAIL_MODE;
  private readonly testEmails = TEST_EMAILS;

  constructor() {
    this.logger.log(`📧 NotificationService iniciado en modo: ${this.emailMode.toUpperCase()}`);
    if (this.emailMode === 'test') {
      this.logger.warn(`⚠️ MODO TEST: Todos los correos se enviarán a: ${this.testEmails.join(', ')}`);
    }
  }

  /**
   * Envía notificación cuando se crea un reporte
   */
  async sendReportCreatedNotification(data: ReportNotificationData): Promise<boolean> {
    try {
      const { recipients, originalRecipients } = this.getRecipients(data);
      
      if (recipients.length === 0) {
        this.logger.warn(`No recipients found for report #${data.reportId}`);
        return false;
      }

      const subject = this.buildSubject(data);
      let html = this.buildCreatedEmailHtml(data);
      
      // En modo test, agregar info de destinatarios originales al email
      if (this.emailMode === 'test') {
        html = this.addTestModeInfo(html, originalRecipients);
      }

      await MailUtil.sendMail({
        to: recipients[0],
        cc: recipients.slice(1),
        subject: this.emailMode === 'test' ? `[TEST] ${subject}` : subject,
        html,
      });

      this.logger.log(`✅ Notification sent for ${data.module} report #${data.reportId} (${data.action}) - Mode: ${this.emailMode}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send notification for report #${data.reportId}:`, error);
      return false;
    }
  }

  /**
   * Envía notificación cuando se cierra un reporte
   */
  async sendReportClosedNotification(data: ReportNotificationData): Promise<boolean> {
    try {
      const { recipients, originalRecipients } = this.getRecipients(data);
      
      if (recipients.length === 0) {
        this.logger.warn(`No recipients found for report #${data.reportId}`);
        return false;
      }

      const subject = this.buildSubject(data);
      let html = this.buildClosedEmailHtml(data);
      
      // En modo test, agregar info de destinatarios originales al email
      if (this.emailMode === 'test') {
        html = this.addTestModeInfo(html, originalRecipients);
      }

      await MailUtil.sendMail({
        to: recipients[0],
        cc: recipients.slice(1),
        subject: this.emailMode === 'test' ? `[TEST] ${subject}` : subject,
        html,
      });

      this.logger.log(`✅ Notification sent for ${data.module} report #${data.reportId} (${data.action}) - Mode: ${this.emailMode}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send notification for report #${data.reportId}:`, error);
      return false;
    }
  }

  /**
   * Envía recordatorio de SLA vencido (reporte abierto más de 5 días)
   */
  async sendSlaReminderNotification(data: ReportNotificationData): Promise<boolean> {
    try {
      const { recipients, originalRecipients } = this.getRecipients(data);
      
      if (recipients.length === 0) {
        this.logger.warn(`No recipients found for reminder report #${data.reportId}`);
        return false;
      }

      const subject = this.buildSubject(data);
      let html = this.buildReminderEmailHtml(data);
      
      // En modo test, agregar info de destinatarios originales al email
      if (this.emailMode === 'test') {
        html = this.addTestModeInfo(html, originalRecipients);
      }

      await MailUtil.sendMail({
        to: recipients[0],
        cc: recipients.slice(1),
        subject: this.emailMode === 'test' ? `[TEST] ${subject}` : subject,
        html,
      });

      this.logger.log(`✅ Reminder sent for ${data.module} report #${data.reportId} (${data.daysOpen} días) - Mode: ${this.emailMode}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send reminder for report #${data.reportId}:`, error);
      return false;
    }
  }

  /**
   * Obtiene los destinatarios según el modo (test/producción)
   */
  private getRecipients(data: ReportNotificationData): { recipients: string[], originalRecipients: string[] } {
    const originalRecipients = this.buildRecipientList(data);
    
    if (this.emailMode === 'production') {
      return { recipients: originalRecipients, originalRecipients };
    }
    
    // Modo test: usar emails de prueba
    return { recipients: [...this.testEmails], originalRecipients };
  }

  /**
   * Agrega información de modo test al email
   */
  private addTestModeInfo(html: string, originalRecipients: string[]): string {
    const testBanner = `
      <div style="background-color: #fff3cd; border: 2px solid #ffc107; padding: 15px; margin: 0 0 20px 0; border-radius: 8px;">
        <p style="margin: 0; color: #856404; font-weight: bold; font-size: 14px;">
          🧪 MODO TEST - Este correo NO fue enviado a los destinatarios reales
        </p>
        <p style="margin: 10px 0 0; color: #856404; font-size: 13px;">
          <strong>Destinatarios originales:</strong><br>
          ${originalRecipients.length > 0 ? originalRecipients.join(', ') : '(ninguno configurado)'}
        </p>
      </div>
    `;
    
    // Insertar el banner después del primer <body> o al inicio del contenido
    return html.replace(
      /<body[^>]*>([\s\S]*?<div)/i,
      (match, content) => match.replace(content, content + testBanner)
    );
  }

  /**
   * Construye la lista de destinatarios (destinatarios reales)
   */
  private buildRecipientList(data: ReportNotificationData): string[] {
    const recipients: string[] = [];

    // Agregar email del creador
    if (data.creatorEmail) {
      recipients.push(data.creatorEmail);
    }

    // Agregar email del propietario si es diferente
    if (data.ownerEmail && data.ownerEmail !== data.creatorEmail) {
      recipients.push(data.ownerEmail);
    }

    // Agregar emails del contratista
    if (data.contractorEmails && data.contractorEmails.length > 0) {
      data.contractorEmails.forEach(email => {
        if (email && !recipients.includes(email)) {
          recipients.push(email);
        }
      });
    }

    return recipients.filter(email => email && email.includes('@'));
  }

  /**
   * Construye el asunto del correo
   */
  private buildSubject(data: ReportNotificationData): string {
    const moduleLabel = data.module === 'ILV' ? 'ILV' : 'Inspección';
    const typeLabel = this.getReportTypeLabel(data.reportType);
    
    if (data.action === 'reminder') {
      return `[KAPA] ⚠️ RECORDATORIO: ${moduleLabel} - ${typeLabel} #${data.reportId} - ${data.daysOpen} días sin cerrar`;
    }
    
    const actionLabel = data.action === 'created' ? 'NUEVO' : 'CERRADO';
    return `[KAPA] ${actionLabel}: ${moduleLabel} - ${typeLabel} #${data.reportId}`;
  }

  /**
   * Obtiene la etiqueta legible del tipo de reporte
   */
  private getReportTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'hazard_id': 'Hazard ID',
      'wit': 'WIT',
      'swa': 'SWA',
      'fdkar': 'FDKAR',
      'tecnica': 'Inspección Técnica',
      'auditoria': 'Auditoría Cruzada',
    };
    return labels[type] || type;
  }

  /**
   * Genera HTML para notificación de reporte creado
   */
  private buildCreatedEmailHtml(data: ReportNotificationData): string {
    const typeLabel = this.getReportTypeLabel(data.reportType);
    const moduleLabel = data.module === 'ILV' ? 'ILV' : 'Inspección';
    const reportUrl = `${this.frontendUrl}/${data.module.toLowerCase()}`;

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nuevo Reporte ${moduleLabel}</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <div style="background-color: #1976d2; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">📋 Nuevo Reporte ${moduleLabel}</h1>
            <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">${typeLabel} #${data.reportId}</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Se ha creado un nuevo reporte en el sistema KAPA que requiere su atención.
            </p>
            
            <!-- Info Box -->
            <div style="background-color: #e3f2fd; border-left: 4px solid #1976d2; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 140px;"><strong>Tipo:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${typeLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Módulo:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${moduleLabel}</td>
                </tr>
                ${data.projectName ? `
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Proyecto:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${data.projectName}</td>
                </tr>
                ` : ''}
                ${data.clientName ? `
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Cliente:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${data.clientName}</td>
                </tr>
                ` : ''}
                ${data.contractorName ? `
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Empresa:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${data.contractorName}</td>
                </tr>
                ` : ''}
                ${data.creatorName ? `
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Creado por:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${data.creatorName}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${reportUrl}" 
                 style="display: inline-block; background-color: #1976d2; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                Ver Reporte
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.5;">
              Este reporte está pendiente de acción. Por favor, revise los detalles y tome las medidas necesarias.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Este es un mensaje automático del sistema KAPA.<br>
              Por favor no responda a este correo.
            </p>
          </div>
          
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera HTML para notificación de reporte cerrado
   */
  private buildClosedEmailHtml(data: ReportNotificationData): string {
    const typeLabel = this.getReportTypeLabel(data.reportType);
    const moduleLabel = data.module === 'ILV' ? 'ILV' : 'Inspección';
    const reportUrl = `${this.frontendUrl}/${data.module.toLowerCase()}`;

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte ${moduleLabel} Cerrado</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <div style="background-color: #388e3c; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">✅ Reporte Cerrado</h1>
            <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">${typeLabel} #${data.reportId}</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              El siguiente reporte ha sido cerrado exitosamente en el sistema KAPA.
            </p>
            
            <!-- Info Box -->
            <div style="background-color: #e8f5e9; border-left: 4px solid #388e3c; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 140px;"><strong>Tipo:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${typeLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Módulo:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${moduleLabel}</td>
                </tr>
                ${data.projectName ? `
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Proyecto:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${data.projectName}</td>
                </tr>
                ` : ''}
                ${data.clientName ? `
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Cliente:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${data.clientName}</td>
                </tr>
                ` : ''}
                ${data.contractorName ? `
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Empresa:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${data.contractorName}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Estado:</strong></td>
                  <td style="padding: 8px 0; color: #388e3c; font-weight: bold;">CERRADO</td>
                </tr>
              </table>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${reportUrl}" 
                 style="display: inline-block; background-color: #388e3c; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                Ver Detalle
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.5;">
              Este reporte ha sido procesado y cerrado. Puede consultar el historial completo en la plataforma.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Este es un mensaje automático del sistema KAPA.<br>
              Por favor no responda a este correo.
            </p>
          </div>
          
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera HTML para recordatorio de SLA vencido
   */
  private buildReminderEmailHtml(data: ReportNotificationData): string {
    const typeLabel = this.getReportTypeLabel(data.reportType);
    const moduleLabel = data.module === 'ILV' ? 'ILV' : 'Inspección';
    const reportUrl = `${this.frontendUrl}/${data.module.toLowerCase()}`;
    const daysOpen = data.daysOpen || 0;
    const createdDate = data.createdAt ? new Date(data.createdAt).toLocaleDateString('es-CO') : 'N/A';
    
    // Determinar nivel de urgencia
    const isUrgent = daysOpen >= 10;
    const headerColor = isUrgent ? '#c62828' : '#f57c00'; // Rojo si >= 10 días, naranja si < 10
    const headerIcon = isUrgent ? '🚨' : '⚠️';
    const urgencyText = isUrgent ? 'URGENTE' : 'PENDIENTE';

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recordatorio - Reporte ${moduleLabel}</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <div style="background-color: ${headerColor}; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">${headerIcon} RECORDATORIO: Reporte ${urgencyText}</h1>
            <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">${typeLabel} #${data.reportId}</p>
          </div>
          
          <!-- Days Counter -->
          <div style="background-color: ${isUrgent ? '#ffebee' : '#fff3e0'}; padding: 20px; text-align: center; border-bottom: 1px solid #e0e0e0;">
            <div style="font-size: 48px; font-weight: bold; color: ${headerColor};">${daysOpen}</div>
            <div style="font-size: 16px; color: #666; text-transform: uppercase;">días sin cerrar</div>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              ${isUrgent 
                ? '<strong>¡Atención!</strong> Este reporte lleva más de 10 días abierto y requiere acción inmediata.'
                : 'Este reporte ha superado el tiempo esperado de cierre (5 días). Por favor, tome las acciones necesarias.'}
            </p>
            
            <!-- Info Box -->
            <div style="background-color: ${isUrgent ? '#ffebee' : '#fff3e0'}; border-left: 4px solid ${headerColor}; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 140px;"><strong>Tipo:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${typeLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Módulo:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${moduleLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Fecha creación:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${createdDate}</td>
                </tr>
                ${data.projectName ? `
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Proyecto:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${data.projectName}</td>
                </tr>
                ` : ''}
                ${data.clientName ? `
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Cliente:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${data.clientName}</td>
                </tr>
                ` : ''}
                ${data.contractorName ? `
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Empresa:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${data.contractorName}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Estado:</strong></td>
                  <td style="padding: 8px 0; color: ${headerColor}; font-weight: bold;">ABIERTO (${daysOpen} días)</td>
                </tr>
              </table>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${reportUrl}" 
                 style="display: inline-block; background-color: ${headerColor}; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                Gestionar Reporte
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.5;">
              Por favor, revise este reporte y proceda a cerrarlo con el plan de acción correspondiente.
              <br><br>
              <em>Este recordatorio se enviará diariamente hasta que el reporte sea cerrado.</em>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Este es un mensaje automático del sistema KAPA.<br>
              Por favor no responda a este correo.
            </p>
          </div>
          
        </div>
      </body>
      </html>
    `;
  }
}
