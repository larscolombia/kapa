import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { FormTemplate } from '../../../database/entities/form-template.entity';
import { FormTemplateClassification } from '../../../database/entities/form-template-classification.entity';
import { InspeccionMaestro } from '../../../database/entities/inspeccion-maestro.entity';
import {
  CreateFormTemplateDto,
  UpdateFormTemplateDto,
  FilterFormTemplateDto,
  AssignClassificationsDto,
  DuplicateFormTemplateDto,
} from '../dto';

@Injectable()
export class FormTemplateService {
  constructor(
    @InjectRepository(FormTemplate)
    private templateRepository: Repository<FormTemplate>,
    @InjectRepository(FormTemplateClassification)
    private classificationRepository: Repository<FormTemplateClassification>,
    @InjectRepository(InspeccionMaestro)
    private maestroRepository: Repository<InspeccionMaestro>,
  ) {}

  /**
   * Crear una nueva plantilla de formulario
   */
  async create(dto: CreateFormTemplateDto, userId: number): Promise<FormTemplate> {
    // Verificar nombre único
    const existing = await this.templateRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Ya existe un formulario con el nombre "${dto.name}"`);
    }

    const template = this.templateRepository.create({
      ...dto,
      created_by: userId,
      version: 1,
    });

    return this.templateRepository.save(template);
  }

  /**
   * Obtener todas las plantillas con filtros
   */
  async findAll(filters: FilterFormTemplateDto): Promise<{ data: FormTemplate[]; total: number }> {
    const { search, is_active, is_draft, maestro_id, page = 1, limit = 20 } = filters;

    const queryBuilder = this.templateRepository
      .createQueryBuilder('template')
      .leftJoinAndSelect('template.creator', 'creator')
      .leftJoinAndSelect('template.classifications', 'classifications')
      .leftJoinAndSelect('classifications.clasificacion', 'clasificacion');

    // Filtro por búsqueda
    if (search) {
      queryBuilder.andWhere(
        '(template.name ILIKE :search OR template.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Filtro por estado activo
    if (is_active !== undefined) {
      queryBuilder.andWhere('template.is_active = :is_active', { is_active });
    }

    // Filtro por borrador
    if (is_draft !== undefined) {
      queryBuilder.andWhere('template.is_draft = :is_draft', { is_draft });
    }

    // Filtro por clasificación
    if (maestro_id) {
      queryBuilder.andWhere('classifications.maestro_id = :maestro_id', { maestro_id });
    }

    // Ordenar por fecha de creación descendente
    queryBuilder.orderBy('template.created_at', 'DESC');

    // Paginación
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  /**
   * Obtener una plantilla por ID
   */
  async findOne(id: number): Promise<FormTemplate> {
    const template = await this.templateRepository.findOne({
      where: { form_template_id: id },
      relations: ['creator', 'classifications', 'classifications.clasificacion'],
    });

    if (!template) {
      throw new NotFoundException(`Formulario con ID ${id} no encontrado`);
    }

    return template;
  }

  /**
   * Actualizar una plantilla
   */
  async update(id: number, dto: UpdateFormTemplateDto): Promise<FormTemplate> {
    const template = await this.findOne(id);

    // Verificar nombre único si se está cambiando
    if (dto.name && dto.name !== template.name) {
      const existing = await this.templateRepository.findOne({
        where: { name: dto.name },
      });
      if (existing) {
        throw new ConflictException(`Ya existe un formulario con el nombre "${dto.name}"`);
      }
    }

    // Incrementar versión si se solicita
    if (dto.increment_version) {
      template.version += 1;
      delete dto.increment_version;
    }

    Object.assign(template, dto);
    return this.templateRepository.save(template);
  }

  /**
   * Eliminar una plantilla
   */
  async remove(id: number): Promise<void> {
    const template = await this.findOne(id);
    
    // Verificar que no tenga respuestas asociadas
    const submissionsCount = await this.templateRepository
      .createQueryBuilder('template')
      .leftJoin('template.submissions', 'submissions')
      .where('template.form_template_id = :id', { id })
      .select('COUNT(submissions.form_submission_id)', 'count')
      .getRawOne();

    if (parseInt(submissionsCount.count) > 0) {
      throw new BadRequestException(
        'No se puede eliminar el formulario porque tiene respuestas asociadas. Desactívelo en su lugar.'
      );
    }

    await this.templateRepository.remove(template);
  }

  /**
   * Duplicar una plantilla
   */
  async duplicate(id: number, dto: DuplicateFormTemplateDto, userId: number): Promise<FormTemplate> {
    const original = await this.findOne(id);

    const newName = dto.new_name || `${original.name} (copia)`;

    // Verificar nombre único
    const existing = await this.templateRepository.findOne({
      where: { name: newName },
    });
    if (existing) {
      throw new ConflictException(`Ya existe un formulario con el nombre "${newName}"`);
    }

    const duplicate = this.templateRepository.create({
      name: newName,
      description: original.description,
      schema: JSON.parse(JSON.stringify(original.schema)),
      settings: JSON.parse(JSON.stringify(original.settings)),
      is_active: false,
      is_draft: true,
      created_by: userId,
      version: 1,
    });

    return this.templateRepository.save(duplicate);
  }

  /**
   * Asignar clasificaciones a un formulario
   */
  async assignClassifications(id: number, dto: AssignClassificationsDto): Promise<FormTemplate> {
    const template = await this.findOne(id);

    // Verificar que las clasificaciones existan
    const maestroIds = dto.classifications.map(c => c.maestro_id);
    const maestros = await this.maestroRepository.find({
      where: {
        maestro_id: In(maestroIds),
        tipo: 'clasificacion_inspeccion',
        activo: true,
      },
    });

    if (maestros.length !== maestroIds.length) {
      throw new BadRequestException('Una o más clasificaciones no existen o no están activas');
    }

    // Eliminar clasificaciones existentes
    await this.classificationRepository.delete({ form_template_id: id });

    // Crear nuevas clasificaciones
    const classifications = dto.classifications.map((c, index) =>
      this.classificationRepository.create({
        form_template_id: id,
        maestro_id: c.maestro_id,
        orden: c.orden ?? index,
        is_required: c.is_required ?? false,
      })
    );

    await this.classificationRepository.save(classifications);

    return this.findOne(id);
  }

  /**
   * Obtener formularios por clasificación
   */
  async findByClassification(maestroId: number): Promise<FormTemplate[]> {
    return this.templateRepository
      .createQueryBuilder('template')
      .innerJoinAndSelect('template.classifications', 'classification')
      .innerJoinAndSelect('classification.clasificacion', 'clasificacion')
      .where('classification.maestro_id = :maestroId', { maestroId })
      .andWhere('template.is_active = true')
      .orderBy('classification.orden', 'ASC')
      .getMany();
  }

  /**
   * Obtener clasificaciones disponibles para asignar
   */
  async getAvailableClassifications(): Promise<InspeccionMaestro[]> {
    return this.maestroRepository.find({
      where: {
        tipo: 'clasificacion_inspeccion',
        activo: true,
      },
      order: { orden: 'ASC' },
    });
  }

  /**
   * Validar el esquema de un formulario
   */
  validateSchema(schema: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!schema || !Array.isArray(schema.fields)) {
      errors.push('El esquema debe tener una propiedad "fields" que sea un array');
      return { valid: false, errors };
    }

    const validateField = (field: any, path: string) => {
      if (!field.id) {
        errors.push(`${path}: El campo debe tener un "id"`);
      }
      if (!field.type) {
        errors.push(`${path}: El campo debe tener un "type"`);
      }
      if (!field.key) {
        errors.push(`${path}: El campo debe tener un "key"`);
      }

      // Validar campos anidados
      if (field.fields && Array.isArray(field.fields)) {
        field.fields.forEach((f: any, i: number) => 
          validateField(f, `${path}.fields[${i}]`)
        );
      }

      // Validar tabs
      if (field.tabs && Array.isArray(field.tabs)) {
        field.tabs.forEach((tab: any, i: number) => {
          if (!tab.label) {
            errors.push(`${path}.tabs[${i}]: Cada tab debe tener un "label"`);
          }
          if (tab.fields && Array.isArray(tab.fields)) {
            tab.fields.forEach((f: any, j: number) =>
              validateField(f, `${path}.tabs[${i}].fields[${j}]`)
            );
          }
        });
      }
    };

    schema.fields.forEach((field: any, i: number) => 
      validateField(field, `fields[${i}]`)
    );

    return { valid: errors.length === 0, errors };
  }
}
