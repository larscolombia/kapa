import { Controller, Get, Query, Res, BadRequestException, Header } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Response } from 'express';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('/audit')
  async getAuditReport(@Query() filters: any) {
    try {
      return await this.reportsService.getAuditReport({
        clientId: filters.clientId ? parseInt(filters.clientId) : undefined,
        contractorId: filters.contractorId ? parseInt(filters.contractorId) : undefined,
        projectId: filters.projectId ? parseInt(filters.projectId) : undefined,
        startDate: filters.startDate ? new Date(filters.startDate) : undefined,
        endDate: filters.endDate ? new Date(filters.endDate) : undefined,
        state: filters.state,
      });
    } catch (error) {
      throw new BadRequestException('Error al obtener el reporte de auditoría');
    }
  }

  @Get('/metrics')
  async getMetrics(@Query() filters: any) {
    try {
      return await this.reportsService.getResponseTimeMetrics({
        clientId: filters.clientId ? parseInt(filters.clientId) : undefined,
        contractorId: filters.contractorId ? parseInt(filters.contractorId) : undefined,
        projectId: filters.projectId ? parseInt(filters.projectId) : undefined,
        startDate: filters.startDate ? new Date(filters.startDate) : undefined,
        endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      });
    } catch (error) {
      throw new BadRequestException('Error al obtener las métricas');
    }
  }

  @Get('/sla')
  async getSLAMetrics(@Query() filters: any) {
    try {
      return await this.reportsService.getSLAMetrics({
        clientId: filters.clientId ? parseInt(filters.clientId) : undefined,
        contractorId: filters.contractorId ? parseInt(filters.contractorId) : undefined,
        projectId: filters.projectId ? parseInt(filters.projectId) : undefined,
      });
    } catch (error) {
      throw new BadRequestException('Error al obtener métricas de SLA');
    }
  }

  @Get('/export/excel')
  async exportToExcel(@Query() filters: any, @Res() res: Response) {
    try {
      const buffer = await this.reportsService.generateExcelReport({
        clientId: filters.clientId ? parseInt(filters.clientId) : undefined,
        contractorId: filters.contractorId ? parseInt(filters.contractorId) : undefined,
        projectId: filters.projectId ? parseInt(filters.projectId) : undefined,
        startDate: filters.startDate ? new Date(filters.startDate) : undefined,
        endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      });

      const fileName = `reporte_auditoria_${new Date().toISOString().split('T')[0]}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(buffer);
    } catch (error) {
      throw new BadRequestException('Error al generar el reporte Excel');
    }
  }

  @Get('/export/pdf')
  @Header('Content-Type', 'application/pdf')
  async exportToPdf(@Query() filters: any, @Res() res: Response) {
    try {
      const buffer = await this.reportsService.generatePdfReport({
        clientId: filters.clientId ? parseInt(filters.clientId) : undefined,
        contractorId: filters.contractorId ? parseInt(filters.contractorId) : undefined,
        projectId: filters.projectId ? parseInt(filters.projectId) : undefined,
        startDate: filters.startDate ? new Date(filters.startDate) : undefined,
        endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      });

      const fileName = `reporte_auditoria_${new Date().toISOString().split('T')[0]}.pdf`;

      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', buffer.length);
      res.end(buffer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new BadRequestException('Error al generar el reporte PDF');
    }
  }
}
