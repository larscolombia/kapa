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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { FormSubmissionService } from '../services/form-submission.service';
import { FormDraftService } from '../services/form-draft.service';
import {
  CreateFormSubmissionDto,
  UpdateFormSubmissionDto,
  FilterFormSubmissionDto,
  SaveFormDraftDto,
  FilterFormDraftDto,
} from '../dto';

@Controller('form-builder/submissions')
@UseGuards(JwtAuthGuard)
export class FormSubmissionController {
  constructor(
    private submissionService: FormSubmissionService,
    private draftService: FormDraftService,
  ) {}

  /**
   * Enviar respuesta de formulario
   * POST /api/form-builder/submissions
   */
  @Post()
  async submit(@Body() dto: CreateFormSubmissionDto, @Req() req) {
    const userId = req.user.user_id;
    const result = await this.submissionService.submit(dto, userId);
    
    // Eliminar borrador si existe
    await this.draftService.removeOnSubmit(
      dto.form_template_id,
      dto.inspeccion_report_id,
      userId,
    );
    
    return result;
  }

  /**
   * Listar respuestas con filtros
   * GET /api/form-builder/submissions
   */
  @Get()
  async findAll(@Query() filters: FilterFormSubmissionDto) {
    return this.submissionService.findAll(filters);
  }

  // ==================== BORRADORES ====================
  // NOTA: Estas rutas de borradores deben estar ANTES de las rutas con :id

  /**
   * Guardar borrador (autoguardado)
   * POST /api/form-builder/submissions/draft
   */
  @Post('draft')
  async saveDraft(@Body() dto: SaveFormDraftDto, @Req() req) {
    const userId = req.user.user_id;
    return this.draftService.save(dto, userId);
  }

  /**
   * Listar borradores del usuario
   * GET /api/form-builder/submissions/drafts/list
   */
  @Get('drafts/list')
  async listDrafts(@Query() filters: FilterFormDraftDto, @Req() req) {
    const userId = req.user.user_id;
    return this.draftService.findByUser(userId, filters);
  }

  /**
   * Obtener borrador del usuario
   * GET /api/form-builder/submissions/draft/:templateId
   */
  @Get('draft/:templateId')
  async getDraft(
    @Param('templateId', ParseIntPipe) templateId: number,
    @Query('reportId') reportId: string,
    @Req() req,
  ) {
    const userId = req.user.user_id;
    return this.draftService.findOne(
      templateId,
      userId,
      reportId ? parseInt(reportId, 10) : undefined,
    );
  }

  /**
   * Eliminar borrador
   * DELETE /api/form-builder/submissions/draft/:id
   */
  @Delete('draft/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeDraft(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const userId = req.user.user_id;
    await this.draftService.remove(id, userId);
  }

  // ==================== RESPUESTAS (SUBMISSIONS) ====================

  /**
   * Obtener respuestas por inspección
   * GET /api/form-builder/submissions/by-report/:reportId
   */
  @Get('by-report/:reportId')
  async findByReport(@Param('reportId', ParseIntPipe) reportId: number) {
    return this.submissionService.findByReport(reportId);
  }

  /**
   * Obtener historial de cambios
   * GET /api/form-builder/submissions/:id/history
   */
  @Get(':id/history')
  async getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.submissionService.getHistory(id);
  }

  /**
   * Obtener respuesta específica
   * GET /api/form-builder/submissions/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.submissionService.findOne(id);
  }

  /**
   * Actualizar respuesta
   * PUT /api/form-builder/submissions/:id
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFormSubmissionDto,
    @Req() req,
  ) {
    const userId = req.user.user_id;
    return this.submissionService.update(id, dto, userId);
  }

  /**
   * Eliminar respuesta (admin)
   * DELETE /api/form-builder/submissions/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.submissionService.remove(id);
  }
}
