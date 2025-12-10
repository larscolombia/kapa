import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { FormTemplateClassification } from './form-template-classification.entity';
import { FormSubmission } from './form-submission.entity';

/**
 * Interfaz para el esquema JSON del formulario
 */
export interface FormFieldSchema {
  id: string;
  type: string;
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: Record<string, any>;
  options?: Array<{ value: string; label: string }>;
  conditional?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  };
  fields?: FormFieldSchema[]; // Para campos anidados (group, repeater, tabs, etc.)
  tabs?: Array<{ label: string; icon?: string; fields: FormFieldSchema[] }>;
  columns?: number | number[];
  formula?: string;
  defaultValue?: any;
  props?: Record<string, any>;
}

export interface FormSchema {
  fields: FormFieldSchema[];
  version?: string;
}

export interface FormSettings {
  scoring?: {
    enabled: boolean;
    maxScore?: number;
    passingScore?: number;
  };
  multiLanguage?: {
    enabled: boolean;
    languages?: string[];
    defaultLanguage?: string;
  };
  autoSave?: {
    enabled: boolean;
    intervalSeconds?: number;
  };
  submitButton?: {
    text?: string;
    confirmMessage?: string;
  };
}

@Entity('form_template')
export class FormTemplate {
  @PrimaryGeneratedColumn()
  form_template_id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', default: { fields: [] } })
  schema: FormSchema;

  @Column({ type: 'jsonb', default: {} })
  settings: FormSettings;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_draft: boolean;

  @Column({ nullable: true })
  created_by: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => FormTemplateClassification, (ftc) => ftc.formTemplate)
  classifications: FormTemplateClassification[];

  @OneToMany(() => FormSubmission, (submission) => submission.formTemplate)
  submissions: FormSubmission[];
}
