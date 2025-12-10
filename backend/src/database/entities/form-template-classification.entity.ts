import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { FormTemplate } from './form-template.entity';
import { InspeccionMaestro } from './inspeccion-maestro.entity';

@Entity('form_template_classification')
@Unique(['form_template_id', 'maestro_id'])
export class FormTemplateClassification {
  @PrimaryGeneratedColumn()
  form_classification_id: number;

  @Column()
  form_template_id: number;

  @ManyToOne(() => FormTemplate, (template) => template.classifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'form_template_id' })
  formTemplate: FormTemplate;

  @Column()
  maestro_id: number;

  @ManyToOne(() => InspeccionMaestro, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'maestro_id' })
  clasificacion: InspeccionMaestro;

  @Column({ type: 'int', default: 0 })
  orden: number;

  @Column({ type: 'boolean', default: false })
  is_required: boolean;

  @CreateDateColumn()
  created_at: Date;
}
