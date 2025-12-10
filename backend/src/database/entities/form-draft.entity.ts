import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FormTemplate } from './form-template.entity';
import { InspeccionReport } from './inspeccion-report.entity';
import { User } from './user.entity';

@Entity('form_draft')
export class FormDraft {
  @PrimaryGeneratedColumn()
  form_draft_id: number;

  @Column()
  form_template_id: number;

  @ManyToOne(() => FormTemplate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'form_template_id' })
  formTemplate: FormTemplate;

  @Column({ nullable: true })
  inspeccion_report_id: number;

  @ManyToOne(() => InspeccionReport, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspeccion_report_id' })
  inspeccionReport: InspeccionReport;

  @Column()
  user_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'jsonb', default: {} })
  data: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  last_field_edited: string;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
