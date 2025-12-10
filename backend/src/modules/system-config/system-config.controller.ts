import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SystemConfigService } from './system-config.service';
import {
  CreateWorkCenterDto,
  UpdateWorkCenterDto,
  CreateIlvMaestroDto,
  UpdateIlvMaestroDto,
  CreateInspeccionMaestroDto,
  UpdateInspeccionMaestroDto,
  FilterMaestrosDto,
} from './dto';

@Controller('system-config')
@UseGuards(JwtAuthGuard)
export class SystemConfigController {
  constructor(private readonly configService: SystemConfigService) {}

  // ============================================
  // CONFIGURACIÓN Y METADATA
  // ============================================

  /**
   * Obtiene la configuración de maestros (metadata para el frontend)
   * GET /api/system-config/maestros-config
   */
  @Get('maestros-config')
  getMaestrosConfig() {
    return this.configService.getMaestrosConfig();
  }

  /**
   * Obtiene estadísticas generales del sistema
   * GET /api/system-config/stats
   */
  @Get('stats')
  async getSystemStats() {
    return this.configService.getSystemStats();
  }

  // ============================================
  // CENTROS DE TRABAJO (WORK CENTERS)
  // ============================================

  /**
   * Listar todos los centros de trabajo
   * GET /api/system-config/work-centers
   */
  @Get('work-centers')
  async getWorkCenters() {
    return this.configService.getWorkCenters();
  }

  /**
   * Obtener un centro de trabajo por ID
   * GET /api/system-config/work-centers/:id
   */
  @Get('work-centers/:id')
  async getWorkCenter(@Param('id', ParseIntPipe) id: number) {
    return this.configService.getWorkCenter(id);
  }

  /**
   * Crear un nuevo centro de trabajo
   * POST /api/system-config/work-centers
   */
  @Post('work-centers')
  async createWorkCenter(@Body() dto: CreateWorkCenterDto) {
    return this.configService.createWorkCenter(dto);
  }

  /**
   * Actualizar un centro de trabajo
   * PUT /api/system-config/work-centers/:id
   */
  @Put('work-centers/:id')
  async updateWorkCenter(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWorkCenterDto,
  ) {
    return this.configService.updateWorkCenter(id, dto);
  }

  /**
   * Eliminar un centro de trabajo
   * DELETE /api/system-config/work-centers/:id
   */
  @Delete('work-centers/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWorkCenter(@Param('id', ParseIntPipe) id: number) {
    await this.configService.deleteWorkCenter(id);
  }

  // ============================================
  // MAESTROS ILV
  // ============================================

  /**
   * Listar maestros ILV con filtros
   * GET /api/system-config/ilv-maestros
   */
  @Get('ilv-maestros')
  async getIlvMaestros(@Query() filters: FilterMaestrosDto) {
    return this.configService.getIlvMaestros(filters);
  }

  /**
   * Resumen de maestros ILV por tipo
   * GET /api/system-config/ilv-maestros/summary
   */
  @Get('ilv-maestros/summary')
  async getIlvMaestrosSummary() {
    return this.configService.getIlvMaestrosSummary();
  }

  /**
   * Obtener maestros ILV por tipo
   * GET /api/system-config/ilv-maestros/tipo/:tipo
   */
  @Get('ilv-maestros/tipo/:tipo')
  async getIlvMaestrosByTipo(
    @Param('tipo') tipo: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.configService.getIlvMaestrosByTipo(tipo, includeInactive === 'true');
  }

  /**
   * Obtener maestros ILV en estructura de árbol
   * GET /api/system-config/ilv-maestros/tree/:tipo
   */
  @Get('ilv-maestros/tree/:tipo')
  async getIlvMaestrosTree(@Param('tipo') tipo: string) {
    return this.configService.getIlvMaestrosTree(tipo);
  }

  /**
   * Obtener un maestro ILV por ID
   * GET /api/system-config/ilv-maestros/:id
   */
  @Get('ilv-maestros/:id')
  async getIlvMaestro(@Param('id', ParseIntPipe) id: number) {
    return this.configService.getIlvMaestro(id);
  }

  /**
   * Crear un nuevo maestro ILV
   * POST /api/system-config/ilv-maestros
   */
  @Post('ilv-maestros')
  async createIlvMaestro(@Body() dto: CreateIlvMaestroDto) {
    return this.configService.createIlvMaestro(dto);
  }

  /**
   * Actualizar un maestro ILV
   * PUT /api/system-config/ilv-maestros/:id
   */
  @Put('ilv-maestros/:id')
  async updateIlvMaestro(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIlvMaestroDto,
  ) {
    return this.configService.updateIlvMaestro(id, dto);
  }

  /**
   * Eliminar (soft delete) un maestro ILV
   * DELETE /api/system-config/ilv-maestros/:id
   */
  @Delete('ilv-maestros/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteIlvMaestro(
    @Param('id', ParseIntPipe) id: number,
    @Query('hard') hard?: string,
  ) {
    await this.configService.deleteIlvMaestro(id, hard !== 'true');
  }

  /**
   * Reactivar un maestro ILV
   * PUT /api/system-config/ilv-maestros/:id/reactivate
   */
  @Put('ilv-maestros/:id/reactivate')
  async reactivateIlvMaestro(@Param('id', ParseIntPipe) id: number) {
    return this.configService.reactivateIlvMaestro(id);
  }

  // ============================================
  // MAESTROS INSPECCIONES
  // ============================================

  /**
   * Listar maestros de inspecciones con filtros
   * GET /api/system-config/inspeccion-maestros
   */
  @Get('inspeccion-maestros')
  async getInspeccionMaestros(@Query() filters: FilterMaestrosDto) {
    return this.configService.getInspeccionMaestros(filters);
  }

  /**
   * Resumen de maestros de inspecciones por tipo
   * GET /api/system-config/inspeccion-maestros/summary
   */
  @Get('inspeccion-maestros/summary')
  async getInspeccionMaestrosSummary() {
    return this.configService.getInspeccionMaestrosSummary();
  }

  /**
   * Obtener maestros de inspecciones por tipo
   * GET /api/system-config/inspeccion-maestros/tipo/:tipo
   */
  @Get('inspeccion-maestros/tipo/:tipo')
  async getInspeccionMaestrosByTipo(
    @Param('tipo') tipo: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.configService.getInspeccionMaestrosByTipo(tipo, includeInactive === 'true');
  }

  /**
   * Obtener maestros de inspecciones en estructura de árbol
   * GET /api/system-config/inspeccion-maestros/tree/:tipo
   */
  @Get('inspeccion-maestros/tree/:tipo')
  async getInspeccionMaestrosTree(@Param('tipo') tipo: string) {
    return this.configService.getInspeccionMaestrosTree(tipo);
  }

  /**
   * Obtener un maestro de inspección por ID
   * GET /api/system-config/inspeccion-maestros/:id
   */
  @Get('inspeccion-maestros/:id')
  async getInspeccionMaestro(@Param('id', ParseIntPipe) id: number) {
    return this.configService.getInspeccionMaestro(id);
  }

  /**
   * Crear un nuevo maestro de inspección
   * POST /api/system-config/inspeccion-maestros
   */
  @Post('inspeccion-maestros')
  async createInspeccionMaestro(@Body() dto: CreateInspeccionMaestroDto) {
    return this.configService.createInspeccionMaestro(dto);
  }

  /**
   * Actualizar un maestro de inspección
   * PUT /api/system-config/inspeccion-maestros/:id
   */
  @Put('inspeccion-maestros/:id')
  async updateInspeccionMaestro(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInspeccionMaestroDto,
  ) {
    return this.configService.updateInspeccionMaestro(id, dto);
  }

  /**
   * Eliminar (soft delete) un maestro de inspección
   * DELETE /api/system-config/inspeccion-maestros/:id
   */
  @Delete('inspeccion-maestros/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteInspeccionMaestro(
    @Param('id', ParseIntPipe) id: number,
    @Query('hard') hard?: string,
  ) {
    await this.configService.deleteInspeccionMaestro(id, hard !== 'true');
  }

  /**
   * Reactivar un maestro de inspección
   * PUT /api/system-config/inspeccion-maestros/:id/reactivate
   */
  @Put('inspeccion-maestros/:id/reactivate')
  async reactivateInspeccionMaestro(@Param('id', ParseIntPipe) id: number) {
    return this.configService.reactivateInspeccionMaestro(id);
  }

  // ============================================
  // PARÁMETROS DEL SISTEMA
  // ============================================

  /**
   * Obtiene todos los parámetros agrupados por categoría
   * GET /api/system-config/parameters
   */
  @Get('parameters')
  async getParameters() {
    return this.configService.getParameters();
  }

  /**
   * Obtiene las categorías de parámetros
   * GET /api/system-config/parameters/categories
   */
  @Get('parameters/categories')
  async getParameterCategories() {
    return this.configService.getParameterCategories();
  }

  /**
   * Obtiene parámetros por categoría
   * GET /api/system-config/parameters/category/:category
   */
  @Get('parameters/category/:category')
  async getParametersByCategory(@Param('category') category: string) {
    return this.configService.getParametersByCategory(category);
  }

  /**
   * Obtiene un parámetro por key
   * GET /api/system-config/parameters/:key
   */
  @Get('parameters/:key')
  async getParameter(@Param('key') key: string) {
    return this.configService.getParameter(key);
  }

  /**
   * Actualiza un parámetro
   * PUT /api/system-config/parameters/:key
   */
  @Put('parameters/:key')
  async updateParameter(
    @Param('key') key: string,
    @Body('value') value: string,
  ) {
    return this.configService.updateParameter(key, value);
  }

  /**
   * Actualiza múltiples parámetros
   * PUT /api/system-config/parameters
   */
  @Put('parameters')
  async updateParameters(@Body() updates: { key: string; value: string }[]) {
    return this.configService.updateParameters(updates);
  }
}
