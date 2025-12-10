import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { FormDraft } from '../../../database/entities/form-draft.entity';
import { FormTemplate } from '../../../database/entities/form-template.entity';
import { SaveFormDraftDto, FilterFormDraftDto } from '../dto';

@Injectable()
export class FormDraftService {
  constructor(
    @InjectRepository(FormDraft)
    private draftRepository: Repository<FormDraft>,
    @InjectRepository(FormTemplate)
    private templateRepository: Repository<FormTemplate>,
  ) {}

  /**
   * Guardar o actualizar un borrador
   */
  async save(dto: SaveFormDraftDto, userId: number): Promise<FormDraft> {
    // Verificar que el formulario existe
    const template = await this.templateRepository.findOne({
      where: { form_template_id: dto.form_template_id },
    });
    if (!template) {
      throw new NotFoundException('Formulario no encontrado');
    }

    // Buscar borrador existente
    let draft = await this.draftRepository.findOne({
      where: {
        form_template_id: dto.form_template_id,
        inspeccion_report_id: dto.inspeccion_report_id || undefined as any,
        user_id: userId,
      },
    });

    if (draft) {
      // Actualizar borrador existente
      draft.data = dto.data;
      draft.last_field_edited = dto.last_field_edited || null;
      draft.expires_at = this.getExpirationDate();
    } else {
      // Crear nuevo borrador
      draft = this.draftRepository.create({
        form_template_id: dto.form_template_id,
        inspeccion_report_id: dto.inspeccion_report_id,
        user_id: userId,
        data: dto.data,
        last_field_edited: dto.last_field_edited,
        expires_at: this.getExpirationDate(),
      });
    }

    return this.draftRepository.save(draft);
  }

  /**
   * Obtener borrador por usuario, formulario e inspección
   */
  async findOne(
    templateId: number,
    userId: number,
    reportId?: number,
  ): Promise<FormDraft | null> {
    return this.draftRepository.findOne({
      where: {
        form_template_id: templateId,
        user_id: userId,
        inspeccion_report_id: reportId || undefined as any,
      },
      relations: ['formTemplate'],
    });
  }

  /**
   * Obtener todos los borradores de un usuario
   */
  async findByUser(userId: number, filters: FilterFormDraftDto): Promise<FormDraft[]> {
    const queryBuilder = this.draftRepository
      .createQueryBuilder('draft')
      .leftJoinAndSelect('draft.formTemplate', 'template')
      .leftJoinAndSelect('draft.inspeccionReport', 'report')
      .where('draft.user_id = :userId', { userId })
      .andWhere('draft.expires_at > :now', { now: new Date() });

    if (filters.form_template_id) {
      queryBuilder.andWhere('draft.form_template_id = :templateId', {
        templateId: filters.form_template_id,
      });
    }

    if (filters.inspeccion_report_id) {
      queryBuilder.andWhere('draft.inspeccion_report_id = :reportId', {
        reportId: filters.inspeccion_report_id,
      });
    }

    queryBuilder.orderBy('draft.updated_at', 'DESC');

    return queryBuilder.getMany();
  }

  /**
   * Eliminar un borrador
   */
  async remove(id: number, userId: number): Promise<void> {
    const draft = await this.draftRepository.findOne({
      where: { form_draft_id: id, user_id: userId },
    });

    if (!draft) {
      throw new NotFoundException('Borrador no encontrado');
    }

    await this.draftRepository.remove(draft);
  }

  /**
   * Eliminar borrador al enviar formulario
   */
  async removeOnSubmit(templateId: number, reportId: number, userId: number): Promise<void> {
    await this.draftRepository.delete({
      form_template_id: templateId,
      inspeccion_report_id: reportId,
      user_id: userId,
    });
  }

  /**
   * Limpiar borradores expirados (job programado)
   */
  async cleanExpired(): Promise<number> {
    const result = await this.draftRepository.delete({
      expires_at: LessThan(new Date()),
    });
    return result.affected || 0;
  }

  /**
   * Calcular fecha de expiración (7 días)
   */
  private getExpirationDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  }
}
