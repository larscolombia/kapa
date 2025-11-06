import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IlbEmailLog } from '../../../database/entities/ilv-email-log.entity';
import { IlbReport } from '../../../database/entities/ilv-report.entity';

@Injectable()
export class IlbNotificationsService {
  constructor(
    @InjectRepository(IlbEmailLog)
    private emailLogRepo: Repository<IlbEmailLog>,
  ) {}

  async sendReportCreatedEmail(
    report: IlbReport,
    closeToken: string,
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'https://kapa.healtheworld.com.co';
    const closeLink = `${frontendUrl}/ilv/close?rid=${report.report_id}&t=${closeToken}`;
    
    const emailLog = this.emailLogRepo.create({
      report_id: report.report_id,
      to_addr: 'contractor@email.com', // TODO: Get from contractor entity
      subject: `Nuevo Reporte ILV #${report.report_id} - ${report.tipo}`,
      payload: JSON.stringify({ report, closeLink }),
      status: 'pending',
    });

    await this.emailLogRepo.save(emailLog);
    
    // TODO: Integrate with actual email service (SendGrid, SES, etc.)
    console.log(`Email queued for report #${report.report_id}`);
  }

  async sendReportClosedEmail(report: IlbReport): Promise<void> {
    const emailLog = this.emailLogRepo.create({
      report_id: report.report_id,
      to_addr: 'creator@email.com', // TODO: Get from creator
      subject: `Reporte ILV #${report.report_id} CERRADO`,
      payload: JSON.stringify({ report }),
      status: 'pending',
    });

    await this.emailLogRepo.save(emailLog);
    console.log(`Closure email queued for report #${report.report_id}`);
  }
}
