import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { DocumentStateAudit } from '@entities/document-state-audit.entity';
import { Document } from '@entities/document.entity';
import * as ExcelJS from 'exceljs';
import { ExportService, PdfReportData, PdfSection } from '../../common/services/export.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(DocumentStateAudit)
    private auditRepository: Repository<DocumentStateAudit>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) { }

  async getAuditReport(filters: {
    clientId?: number;
    contractorId?: number;
    projectId?: number;
    startDate?: Date;
    endDate?: Date;
    state?: string;
  }) {
    const query = this.auditRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.document', 'document')
      .leftJoinAndSelect('document.subcriterion', 'subcriterion')
      .leftJoinAndSelect('subcriterion.criterion', 'criterion')
      .leftJoinAndSelect('document.projectContractor', 'projectContractor')
      .leftJoinAndSelect('projectContractor.project', 'project')
      .leftJoinAndSelect('projectContractor.contractor', 'contractor')
      .leftJoinAndSelect('project.client', 'client')
      .leftJoinAndSelect('document.employee', 'employee')
      .leftJoinAndSelect('audit.changed_by_user', 'user')
      .orderBy('audit.changed_at', 'DESC');

    if (filters.clientId) {
      query.andWhere('client.client_id = :clientId', { clientId: filters.clientId });
    }

    if (filters.contractorId) {
      query.andWhere('contractor.contractor_id = :contractorId', { contractorId: filters.contractorId });
    }

    if (filters.projectId) {
      query.andWhere('project.project_id = :projectId', { projectId: filters.projectId });
    }

    if (filters.startDate && filters.endDate) {
      query.andWhere('audit.changed_at BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    if (filters.state) {
      query.andWhere('audit.new_state = :state', { state: filters.state });
    }

    return await query.getMany();
  }

  async getResponseTimeMetrics(filters: {
    clientId?: number;
    contractorId?: number;
    projectId?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const audits = await this.getAuditReport(filters);

    // Agrupar por documento y calcular métricas
    const documentMetrics = new Map();

    audits.forEach((audit) => {
      const docId = audit.document_id;
      if (!documentMetrics.has(docId)) {
        documentMetrics.set(docId, {
          document: audit.document,
          timeline: [],
          totalTimeInSubmitted: 0,
          totalTimeInRejected: 0,
          totalResubmissions: 0,
          firstSubmission: null,
          lastApprovalOrRejection: null,
        });
      }

      const metrics = documentMetrics.get(docId);
      metrics.timeline.push(audit);

      // Calcular tiempos en estados
      if (audit.previous_state === 'submitted' && audit.time_in_previous_state_hours) {
        metrics.totalTimeInSubmitted += audit.time_in_previous_state_hours;
      }

      if (audit.new_state === 'rejected') {
        metrics.totalResubmissions++;
      }

      if (audit.new_state === 'submitted' && !metrics.firstSubmission) {
        metrics.firstSubmission = audit.changed_at;
      }

      if (['approved', 'rejected'].includes(audit.new_state)) {
        metrics.lastApprovalOrRejection = audit.changed_at;
      }
    });

    return Array.from(documentMetrics.values());
  }

  async generateExcelReport(filters: {
    clientId?: number;
    contractorId?: number;
    projectId?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Buffer> {
    const metrics = await this.getResponseTimeMetrics(filters);
    const workbook = new ExcelJS.Workbook();

    // Hoja 1: Resumen General
    const summarySheet = workbook.addWorksheet('Resumen General');
    summarySheet.columns = [
      { header: 'Métrica', key: 'metric', width: 40 },
      { header: 'Valor', key: 'value', width: 20 },
    ];

    const totalDocuments = metrics.length;
    const avgResponseTime = metrics.reduce((sum, m) => sum + (m.totalTimeInSubmitted || 0), 0) / totalDocuments || 0;
    const totalRejections = metrics.reduce((sum, m) => sum + m.totalResubmissions, 0);
    const documentsWithRejections = metrics.filter(m => m.totalResubmissions > 0).length;

    summarySheet.addRows([
      { metric: 'Total de Documentos Analizados', value: totalDocuments },
      { metric: 'Tiempo Promedio de Respuesta (horas)', value: avgResponseTime.toFixed(2) },
      { metric: 'Total de Rechazos', value: totalRejections },
      { metric: 'Documentos con Rechazos', value: documentsWithRejections },
      { metric: 'Porcentaje de Rechazo', value: `${((documentsWithRejections / totalDocuments) * 100).toFixed(2)}%` },
    ]);

    // Estilo para el resumen
    summarySheet.getRow(1).font = { bold: true };
    summarySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };

    // Hoja 2: Detalle por Documento
    const detailSheet = workbook.addWorksheet('Detalle por Documento');
    detailSheet.columns = [
      { header: 'Cliente', key: 'client', width: 25 },
      { header: 'Proyecto', key: 'project', width: 30 },
      { header: 'Contratista', key: 'contractor', width: 30 },
      { header: 'Criterio', key: 'criterion', width: 25 },
      { header: 'Subcriterio', key: 'subcriterion', width: 25 },
      { header: 'Empleado', key: 'employee', width: 25 },
      { header: 'Documento', key: 'document', width: 30 },
      { header: 'Primera Carga', key: 'firstSubmission', width: 20 },
      { header: 'Última Revisión', key: 'lastReview', width: 20 },
      { header: 'Tiempo en Revisión (hrs)', key: 'reviewTime', width: 20 },
      { header: 'Número de Rechazos', key: 'rejections', width: 18 },
      { header: 'Estado Actual', key: 'currentState', width: 15 },
    ];

    metrics.forEach((metric) => {
      const doc = metric.document;
      detailSheet.addRow({
        client: doc.projectContractor?.project?.client?.name || 'N/A',
        project: doc.projectContractor?.project?.name || 'N/A',
        contractor: doc.projectContractor?.contractor?.name || 'N/A',
        criterion: doc.subcriterion?.criterion?.name || 'N/A',
        subcriterion: doc.subcriterion?.name || 'N/A',
        employee: doc.employee?.name || 'N/A',
        document: doc.name,
        firstSubmission: metric.firstSubmission ? new Date(metric.firstSubmission).toLocaleString('es-CO') : 'N/A',
        lastReview: metric.lastApprovalOrRejection ? new Date(metric.lastApprovalOrRejection).toLocaleString('es-CO') : 'N/A',
        reviewTime: metric.totalTimeInSubmitted?.toFixed(2) || '0',
        rejections: metric.totalResubmissions,
        currentState: doc.state,
      });
    });

    // Estilo para el detalle
    detailSheet.getRow(1).font = { bold: true };
    detailSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' },
    };

    // Hoja 3: Timeline Completo
    const timelineSheet = workbook.addWorksheet('Timeline Completo');
    timelineSheet.columns = [
      { header: 'Fecha/Hora', key: 'timestamp', width: 20 },
      { header: 'Cliente', key: 'client', width: 25 },
      { header: 'Proyecto', key: 'project', width: 30 },
      { header: 'Contratista', key: 'contractor', width: 30 },
      { header: 'Documento', key: 'document', width: 30 },
      { header: 'Estado Anterior', key: 'previousState', width: 18 },
      { header: 'Estado Nuevo', key: 'newState', width: 18 },
      { header: 'Tiempo en Estado Anterior (hrs)', key: 'timeInState', width: 25 },
      { header: 'Cambiado Por', key: 'changedBy', width: 25 },
      { header: 'Comentarios', key: 'comments', width: 40 },
    ];

    const allAudits = await this.getAuditReport(filters);
    allAudits.forEach((audit) => {
      timelineSheet.addRow({
        timestamp: new Date(audit.changed_at).toLocaleString('es-CO'),
        client: audit.document?.projectContractor?.project?.client?.name || 'N/A',
        project: audit.document?.projectContractor?.project?.name || 'N/A',
        contractor: audit.document?.projectContractor?.contractor?.name || 'N/A',
        document: audit.document?.name || 'N/A',
        previousState: this.translateState(audit.previous_state),
        newState: this.translateState(audit.new_state),
        timeInState: audit.time_in_previous_state_hours?.toFixed(2) || 'N/A',
        changedBy: audit.changed_by_user?.name || audit.changed_by_email || 'Sistema',
        comments: audit.comments || '',
      });
    });

    // Estilo para el timeline
    timelineSheet.getRow(1).font = { bold: true };
    timelineSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFC000' },
    };

    // Generar el buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private translateState(state: string): string {
    const translations = {
      'submitted': 'Enviado',
      'approved': 'Aprobado',
      'rejected': 'Rechazado',
      'not_applicable': 'No Aplica',
      'pending': 'Pendiente',
    };
    return translations[state] || state;
  }

  async getSLAMetrics(filters: {
    clientId?: number;
    contractorId?: number;
    projectId?: number;
  }) {
    const metrics = await this.getResponseTimeMetrics(filters);

    // Definir SLA (por ejemplo, 24 horas para revisión)
    const SLA_HOURS = 24;

    const breachedSLA = metrics.filter(m => m.totalTimeInSubmitted > SLA_HOURS);
    const withinSLA = metrics.filter(m => m.totalTimeInSubmitted <= SLA_HOURS && m.totalTimeInSubmitted > 0);

    return {
      total: metrics.length,
      withinSLA: withinSLA.length,
      breachedSLA: breachedSLA.length,
      slaCompliance: metrics.length > 0 ? ((withinSLA.length / metrics.length) * 100).toFixed(2) : '0',
      averageResponseTime: metrics.reduce((sum, m) => sum + (m.totalTimeInSubmitted || 0), 0) / metrics.length || 0,
      breachedDocuments: breachedSLA.map(m => ({
        document: m.document.name,
        contractor: m.document.projectContractor?.contractor?.name,
        responseTime: m.totalTimeInSubmitted,
      })),
    };
  }

  /**
   * Generar reporte PDF de auditoría
   */
  async generatePdfReport(filters: {
    clientId?: number;
    contractorId?: number;
    projectId?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Buffer> {
    const metrics = await this.getResponseTimeMetrics(filters);
    const slaMetrics = await this.getSLAMetrics(filters);

    // Definir SLA
    const SLA_HOURS = 24;

    // Estadísticas generales
    const totalDocuments = metrics.length;
    const avgResponseTime = metrics.reduce((sum, m) => sum + (m.totalTimeInSubmitted || 0), 0) / totalDocuments || 0;
    const totalRejections = metrics.reduce((sum, m) => sum + m.totalResubmissions, 0);
    const documentsWithRejections = metrics.filter(m => m.totalResubmissions > 0).length;

    // Construir secciones del PDF
    const secciones: PdfSection[] = [
      {
        titulo: 'Resumen General',
        campos: [
          { label: 'Total de Documentos Analizados', value: totalDocuments },
          { label: 'Tiempo Promedio de Respuesta', value: `${avgResponseTime.toFixed(2)} horas` },
          { label: 'Total de Rechazos', value: totalRejections },
          { label: 'Documentos con Rechazos', value: documentsWithRejections },
          { label: 'Porcentaje de Rechazo', value: `${((documentsWithRejections / totalDocuments) * 100 || 0).toFixed(2)}%` },
        ]
      },
      {
        titulo: 'Cumplimiento de SLA',
        campos: [
          { label: 'SLA Configurado', value: `${SLA_HOURS} horas` },
          { label: 'Documentos dentro de SLA', value: slaMetrics.withinSLA },
          { label: 'Documentos fuera de SLA', value: slaMetrics.breachedSLA },
          { label: 'Porcentaje de Cumplimiento', value: `${slaMetrics.slaCompliance}%` },
        ]
      }
    ];

    // Agregar tabla de detalle (máx 30 registros para el PDF)
    if (metrics.length > 0) {
      secciones.push({
        titulo: 'Detalle de Documentos',
        campos: [],
        tabla: {
          headers: ['Cliente', 'Proyecto', 'Contratista', 'Documento', 'T. Revisión (hrs)', 'Rechazos', 'Estado'],
          rows: metrics.slice(0, 30).map(m => {
            const doc = m.document;
            return [
              doc.projectContractor?.project?.client?.name || 'N/A',
              doc.projectContractor?.project?.name || 'N/A',
              doc.projectContractor?.contractor?.name || 'N/A',
              doc.name?.substring(0, 25) || 'N/A',
              m.totalTimeInSubmitted?.toFixed(1) || '0',
              m.totalResubmissions,
              this.translateState(doc.state)
            ];
          })
        }
      });

      if (metrics.length > 30) {
        secciones.push({
          titulo: 'Nota',
          campos: [
            { label: 'Registros mostrados', value: '30' },
            { label: 'Total de registros', value: metrics.length },
            { label: 'Información', value: 'Para ver todos los registros, use la exportación a Excel' }
          ]
        });
      }
    }

    // Agregar documentos fuera de SLA si hay
    if (slaMetrics.breachedDocuments.length > 0) {
      secciones.push({
        titulo: 'Documentos Fuera de SLA (Atención Requerida)',
        campos: [],
        tabla: {
          headers: ['Documento', 'Contratista', 'Tiempo de Respuesta (hrs)'],
          rows: slaMetrics.breachedDocuments.slice(0, 15).map(d => [
            d.document?.substring(0, 30) || 'N/A',
            d.contractor || 'N/A',
            d.responseTime?.toFixed(2) || 'N/A'
          ])
        }
      });
    }

    // Construir subtítulo con filtros aplicados
    const filterParts: string[] = [];
    if (filters.startDate) filterParts.push(`Desde: ${new Date(filters.startDate).toLocaleDateString('es-CO')}`);
    if (filters.endDate) filterParts.push(`Hasta: ${new Date(filters.endDate).toLocaleDateString('es-CO')}`);
    const subtitle = filterParts.length > 0 ? filterParts.join(' | ') : 'Todos los registros';

    const pdfData: PdfReportData = {
      titulo: 'Reporte de Auditoría - Tiempos de Revisión',
      subtitulo: subtitle,
      fechaGeneracion: new Date(),
      secciones
    };

    return ExportService.generatePdf(pdfData);
  }
}
