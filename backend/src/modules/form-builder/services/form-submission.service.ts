import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { FormSubmission } from '../../../database/entities/form-submission.entity';
import { FormSubmissionHistory } from '../../../database/entities/form-submission-history.entity';
import { FormTemplate } from '../../../database/entities/form-template.entity';
import { InspeccionReport } from '../../../database/entities/inspeccion-report.entity';
import {
  CreateFormSubmissionDto,
  UpdateFormSubmissionDto,
  FilterFormSubmissionDto,
} from '../dto';

@Injectable()
export class FormSubmissionService {
  constructor(
    @InjectRepository(FormSubmission)
    private submissionRepository: Repository<FormSubmission>,
    @InjectRepository(FormSubmissionHistory)
    private historyRepository: Repository<FormSubmissionHistory>,
    @InjectRepository(FormTemplate)
    private templateRepository: Repository<FormTemplate>,
    @InjectRepository(InspeccionReport)
    private reportRepository: Repository<InspeccionReport>,
  ) {}

  /**
   * Crear o actualizar una respuesta de formulario
   */
  async submit(dto: CreateFormSubmissionDto, userId: number): Promise<FormSubmission> {
    // Verificar que el formulario existe
    const template = await this.templateRepository.findOne({
      where: { form_template_id: dto.form_template_id, is_active: true },
    });
    if (!template) {
      throw new NotFoundException('Formulario no encontrado o inactivo');
    }

    // Verificar que la inspección existe
    const report = await this.reportRepository.findOne({
      where: { report_id: dto.inspeccion_report_id },
    });
    if (!report) {
      throw new NotFoundException('Inspección no encontrada');
    }

    // Verificar si ya existe una respuesta
    let submission = await this.submissionRepository.findOne({
      where: {
        form_template_id: dto.form_template_id,
        inspeccion_report_id: dto.inspeccion_report_id,
      },
    });

    if (submission) {
      // Actualizar existente
      const previousData = { ...submission.data };
      submission.data = dto.data;
      submission.status = dto.status || 'completed';
      submission.updated_at = new Date();

      // Guardar historial
      await this.createHistory(submission.form_submission_id, previousData, dto.data, userId);

      return this.submissionRepository.save(submission);
    }

    // Crear nueva respuesta
    submission = this.submissionRepository.create({
      form_template_id: dto.form_template_id,
      inspeccion_report_id: dto.inspeccion_report_id,
      data: dto.data,
      status: dto.status || 'completed',
      submitted_by: userId,
    });

    return this.submissionRepository.save(submission);
  }

  /**
   * Actualizar una respuesta existente
   */
  async update(id: number, dto: UpdateFormSubmissionDto, userId: number): Promise<FormSubmission> {
    // Cargar sin relaciones para evitar problemas con TypeORM al guardar
    const submission = await this.submissionRepository.findOne({
      where: { form_submission_id: id },
    });

    if (!submission) {
      throw new NotFoundException(`Respuesta con ID ${id} no encontrada`);
    }

    const previousData = { ...submission.data };

    submission.data = dto.data;
    if (dto.status) {
      submission.status = dto.status;
    }

    // Guardar historial con razón del cambio
    await this.createHistory(id, previousData, dto.data, userId, dto.change_reason);

    // Guardar solo la submission sin cascadas de relaciones
    await this.submissionRepository.save(submission);

    // Retornar con todas las relaciones para la respuesta
    return this.findOne(id);
  }

  /**
   * Obtener una respuesta por ID
   */
  async findOne(id: number): Promise<FormSubmission> {
    const submission = await this.submissionRepository.findOne({
      where: { form_submission_id: id },
      relations: ['formTemplate', 'inspeccionReport', 'submittedByUser', 'history'],
    });

    if (!submission) {
      throw new NotFoundException(`Respuesta con ID ${id} no encontrada`);
    }

    return submission;
  }

  /**
   * Obtener respuesta por inspección y formulario
   */
  async findByReportAndTemplate(reportId: number, templateId: number): Promise<FormSubmission | null> {
    return this.submissionRepository.findOne({
      where: {
        inspeccion_report_id: reportId,
        form_template_id: templateId,
      },
      relations: ['formTemplate', 'submittedByUser'],
    });
  }

  /**
   * Obtener todas las respuestas de una inspección
   */
  async findByReport(reportId: number): Promise<FormSubmission[]> {
    return this.submissionRepository.find({
      where: { inspeccion_report_id: reportId },
      relations: ['formTemplate', 'submittedByUser'],
      order: { submitted_at: 'DESC' },
    });
  }

  /**
   * Obtener todas las respuestas con filtros
   */
  async findAll(filters: FilterFormSubmissionDto): Promise<{ data: FormSubmission[]; total: number }> {
    const {
      form_template_id,
      inspeccion_report_id,
      submitted_by,
      status,
      date_from,
      date_to,
      page = 1,
      limit = 20,
    } = filters;

    const queryBuilder = this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.formTemplate', 'template')
      .leftJoinAndSelect('submission.inspeccionReport', 'report')
      .leftJoinAndSelect('submission.submittedByUser', 'user');

    if (form_template_id) {
      queryBuilder.andWhere('submission.form_template_id = :form_template_id', { form_template_id });
    }

    if (inspeccion_report_id) {
      queryBuilder.andWhere('submission.inspeccion_report_id = :inspeccion_report_id', { inspeccion_report_id });
    }

    if (submitted_by) {
      queryBuilder.andWhere('submission.submitted_by = :submitted_by', { submitted_by });
    }

    if (status) {
      queryBuilder.andWhere('submission.status = :status', { status });
    }

    if (date_from) {
      queryBuilder.andWhere('submission.submitted_at >= :date_from', { date_from });
    }

    if (date_to) {
      queryBuilder.andWhere('submission.submitted_at <= :date_to', { date_to });
    }

    queryBuilder.orderBy('submission.submitted_at', 'DESC');

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  /**
   * Obtener historial de cambios de una respuesta
   */
  async getHistory(submissionId: number): Promise<FormSubmissionHistory[]> {
    return this.historyRepository.find({
      where: { form_submission_id: submissionId },
      relations: ['changedByUser'],
      order: { changed_at: 'DESC' },
    });
  }

  /**
   * Eliminar una respuesta (solo administradores)
   */
  async remove(id: number): Promise<void> {
    const submission = await this.findOne(id);
    await this.submissionRepository.remove(submission);
  }

  /**
   * Crear registro de historial
   */
  private async createHistory(
    submissionId: number,
    previousData: Record<string, any>,
    newData: Record<string, any>,
    userId: number,
    reason?: string,
  ): Promise<void> {
    // Determinar qué campos cambiaron
    const changedFields: string[] = [];
    const allKeys = new Set([...Object.keys(previousData), ...Object.keys(newData)]);

    allKeys.forEach(key => {
      if (JSON.stringify(previousData[key]) !== JSON.stringify(newData[key])) {
        changedFields.push(key);
      }
    });

    if (changedFields.length === 0) {
      return; // No hay cambios, no guardar historial
    }

    const history = this.historyRepository.create({
      form_submission_id: submissionId,
      previous_data: previousData,
      new_data: newData,
      changed_fields: changedFields,
      changed_by: userId,
      change_reason: reason,
    });

    await this.historyRepository.save(history);
  }

  /**
   * Validar datos contra el esquema del formulario
   */
  validateSubmissionData(schema: any, data: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const validateField = (field: any, path: string) => {
      const value = data[field.key];

      // Validar campo requerido
      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field.label || field.key}: Este campo es requerido`);
      }

      // Validar tipo de dato según el tipo de campo
      if (value !== undefined && value !== null) {
        switch (field.type) {
          case 'email':
            if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              errors.push(`${field.label || field.key}: Formato de email inválido`);
            }
            break;
          case 'number':
          case 'decimal':
            if (isNaN(Number(value))) {
              errors.push(`${field.label || field.key}: Debe ser un número`);
            }
            if (field.validation?.min !== undefined && Number(value) < field.validation.min) {
              errors.push(`${field.label || field.key}: El valor mínimo es ${field.validation.min}`);
            }
            if (field.validation?.max !== undefined && Number(value) > field.validation.max) {
              errors.push(`${field.label || field.key}: El valor máximo es ${field.validation.max}`);
            }
            break;
          case 'text':
          case 'textarea':
            if (field.validation?.maxLength && String(value).length > field.validation.maxLength) {
              errors.push(`${field.label || field.key}: Máximo ${field.validation.maxLength} caracteres`);
            }
            if (field.validation?.pattern && !new RegExp(field.validation.pattern).test(value)) {
              errors.push(`${field.label || field.key}: Formato inválido`);
            }
            break;
        }
      }

      // Validar campos anidados
      if (field.fields && Array.isArray(field.fields)) {
        field.fields.forEach((f: any) => validateField(f, `${path}.${f.key}`));
      }

      // Validar tabs
      if (field.tabs && Array.isArray(field.tabs)) {
        field.tabs.forEach((tab: any) => {
          if (tab.fields && Array.isArray(tab.fields)) {
            tab.fields.forEach((f: any) => validateField(f, `${path}.${f.key}`));
          }
        });
      }
    };

    if (schema?.fields) {
      schema.fields.forEach((field: any) => validateField(field, field.key));
    }

    return { valid: errors.length === 0, errors };
  }
}
