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
import { FormTemplateService } from '../services/form-template.service';
import {
  CreateFormTemplateDto,
  UpdateFormTemplateDto,
  FilterFormTemplateDto,
  AssignClassificationsDto,
  DuplicateFormTemplateDto,
} from '../dto';

@Controller('form-builder/templates')
@UseGuards(JwtAuthGuard)
export class FormTemplateController {
  constructor(private templateService: FormTemplateService) {}

  /**
   * Crear nueva plantilla de formulario
   * POST /api/form-builder/templates
   */
  @Post()
  async create(@Body() dto: CreateFormTemplateDto, @Req() req) {
    const userId = req.user.user_id;
    return this.templateService.create(dto, userId);
  }

  /**
   * Listar todas las plantillas con filtros
   * GET /api/form-builder/templates
   */
  @Get()
  async findAll(@Query() filters: FilterFormTemplateDto) {
    return this.templateService.findAll(filters);
  }

  /**
   * Obtener clasificaciones disponibles para asignar
   * GET /api/form-builder/templates/classifications
   */
  @Get('classifications')
  async getAvailableClassifications() {
    return this.templateService.getAvailableClassifications();
  }

  /**
   * Obtener formularios por clasificación
   * GET /api/form-builder/templates/by-classification/:maestroId
   * NOTA: Esta ruta debe estar ANTES de :id para evitar conflictos
   */
  @Get('by-classification/:maestroId')
  async findByClassification(@Param('maestroId', ParseIntPipe) maestroId: number) {
    return this.templateService.findByClassification(maestroId);
  }

  /**
   * Validar esquema de formulario
   * POST /api/form-builder/templates/validate-schema
   */
  @Post('validate-schema')
  async validateSchema(@Body() body: { schema: any }) {
    return this.templateService.validateSchema(body.schema);
  }

  /**
   * Obtener plantilla por ID
   * GET /api/form-builder/templates/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.templateService.findOne(id);
  }

  /**
   * Actualizar plantilla
   * PUT /api/form-builder/templates/:id
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFormTemplateDto,
  ) {
    return this.templateService.update(id, dto);
  }

  /**
   * Eliminar plantilla
   * DELETE /api/form-builder/templates/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.templateService.remove(id);
  }

  /**
   * Duplicar plantilla
   * POST /api/form-builder/templates/:id/duplicate
   */
  @Post(':id/duplicate')
  async duplicate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DuplicateFormTemplateDto,
    @Req() req,
  ) {
    const userId = req.user.user_id;
    return this.templateService.duplicate(id, dto, userId);
  }

  /**
   * Asignar clasificaciones a una plantilla
   * PUT /api/form-builder/templates/:id/classifications
   */
  @Put(':id/classifications')
  async assignClassifications(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignClassificationsDto,
  ) {
    return this.templateService.assignClassifications(id, dto);
  }
}
