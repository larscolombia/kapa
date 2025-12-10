import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Req, 
  ParseIntPipe, 
  Res, 
  Header,
  ForbiddenException
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { InspeccionesReportsService } from '../services/inspecciones-reports.service';
import { InspeccionesSchedulerService } from '../services/inspecciones-scheduler.service';
import { CreateInspeccionReportDto, UpdateInspeccionReportDto, FilterInspeccionDto } from '../dto';

@Controller('inspecciones')
@UseGuards(JwtAuthGuard)
export class InspeccionesController {
  constructor(
    private reportsService: InspeccionesReportsService,
    private schedulerService: InspeccionesSchedulerService,
  ) {}

  /**
   * Crear nuevo reporte de inspección
   * POST /api/inspecciones
   */
  @Post()
  async create(@Body() dto: CreateInspeccionReportDto, @Req() req) {
    const userId = req.user.user_id;
    const roleId = req.user.role_id ?? req.user.role?.role_id;

    return this.reportsService.create(dto, userId, roleId);
  }

  /**
   * Listar reportes con filtros
   * GET /api/inspecciones
   */
  @Get()
  async findAll(@Query() filters: FilterInspeccionDto, @Req() req) {
    const userId = req.user.user_id;
    return this.reportsService.findAll(filters, userId);
  }

  /**
   * Exportar a Excel
   * GET /api/inspecciones/export/excel
   */
  @Get('export/excel')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportExcel(@Query() filters: FilterInspeccionDto, @Req() req, @Res() res: Response) {
    const userId = req.user.user_id;
    const buffer = await this.reportsService.exportToExcel(filters, userId);

    const filename = `inspecciones_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  /**
   * Exportar listado a PDF
   * GET /api/inspecciones/export/pdf
   */
  @Get('export/pdf')
  @Header('Content-Type', 'application/pdf')
  async exportListPdf(@Query() filters: FilterInspeccionDto, @Req() req, @Res() res: Response) {
    const userId = req.user.user_id;
    const buffer = await this.reportsService.exportListToPdf(filters, userId);

    const filename = `inspecciones_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  /**
   * Exportar inspección individual a PDF
   * GET /api/inspecciones/export/pdf/:id
   */
  @Get('export/pdf/:id')
  @Header('Content-Type', 'application/pdf')
  async exportSinglePdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    console.log(`[PDF Export Inspecciones] Generating PDF for report ${id}`);
    const buffer = await this.reportsService.exportToPdf(id);
    console.log(`[PDF Export Inspecciones] Buffer generated, size: ${buffer.length}, isBuffer: ${Buffer.isBuffer(buffer)}`);

    const filename = `inspeccion_${id}_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  }

  /**
   * Obtener tipos de inspección técnica
   * GET /api/inspecciones/maestros/tipos
   */
  @Get('maestros/tipos')
  async getTiposInspeccionTecnica() {
    return this.reportsService.getTiposInspeccionTecnica();
  }

  /**
   * Obtener todas las clasificaciones técnicas (sin filtro de tipo)
   * GET /api/inspecciones/maestros/clasificaciones-tecnicas
   */
  @Get('maestros/clasificaciones-tecnicas')
  async getAllClasificacionesTecnicas() {
    return this.reportsService.getAllClasificacionesTecnicas();
  }

  /**
   * Obtener clasificaciones de auditoría cruzada
   * GET /api/inspecciones/maestros/clasificaciones-auditoria
   * IMPORTANTE: Este endpoint debe ir ANTES de clasificaciones/:tipoId para evitar conflicto de rutas
   */
  @Get('maestros/clasificaciones-auditoria')
  async getClasificacionesAuditoria() {
    return this.reportsService.getClasificacionesAuditoria();
  }

  /**
   * Obtener clasificaciones por tipo de inspección
   * GET /api/inspecciones/maestros/clasificaciones/:tipoId
   */
  @Get('maestros/clasificaciones/:tipoId')
  async getClasificacionesByTipo(@Param('tipoId', ParseIntPipe) tipoId: number) {
    return this.reportsService.getClasificacionesByTipo(tipoId);
  }

  /**
   * Obtener áreas de auditoría
   * GET /api/inspecciones/maestros/areas
   */
  @Get('maestros/areas')
  async getAreasAuditoria() {
    return this.reportsService.getAreasAuditoria();
  }

  /**
   * Obtener estados de reporte
   * GET /api/inspecciones/maestros/estados
   */
  @Get('maestros/estados')
  async getEstados() {

    return this.reportsService.getEstados();

  }

  /**
   * Obtener áreas de inspección técnica
   * GET /api/inspecciones/maestros/areas-inspeccion
   */
  @Get('maestros/areas-inspeccion')
  async getAreasInspeccion() {
    return this.reportsService.getAreasInspeccion();
  }

  /**
   * Obtener usuarios para "Quien reporta"
   * GET /api/inspecciones/maestros/usuarios
   */
  @Get('maestros/usuarios')
  async getUsuarios() {
    return this.reportsService.getUsuarios();
  }

  /**
   * Eliminar múltiples reportes
   * DELETE /api/inspecciones/bulk
   */
  @Delete('bulk')
  async deleteBulk(@Body('ids') ids: number[], @Req() req) {
    const userId = req.user.user_id;
    const roleId = req.user.role_id ?? req.user.role?.role_id;

    if (roleId !== 1) {
      throw new ForbiddenException('Solo administradores pueden eliminar reportes');
    }

    return this.reportsService.deleteBulk(ids, userId, roleId);
  }

  /**
   * Obtener un reporte por ID
   * GET /api/inspecciones/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.findOne(id);
  }

  /**
   * Actualizar un reporte
   * PUT /api/inspecciones/:id
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInspeccionReportDto,
    @Req() req,
  ) {
    const userId = req.user.user_id;
    const roleId = req.user.role_id ?? req.user.role?.role_id;

    return this.reportsService.update(id, dto, userId, roleId);
  }

  /**
   * Ejecuta manualmente el job de recordatorios SLA (solo admin)
   * POST /api/inspecciones/admin/run-sla-reminders
   */
  @Post('admin/run-sla-reminders')
  async runSlaReminders(@Req() req) {
    const roleId = req.user.role_id ?? req.user.role?.role_id;
    
    if (roleId !== 1) {
      throw new ForbiddenException('Solo administradores pueden ejecutar este job');
    }

    await this.schedulerService.ejecutarManual();
    return { success: true, message: 'Job de recordatorios SLA de Inspecciones ejecutado manualmente' };
  }
}
