import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { FormTemplate } from './form-template.entity';
import { InspeccionReport } from './inspeccion-report.entity';
import { User } from './user.entity';
import { FormSubmissionHistory } from './form-submission-history.entity';

export type SubmissionStatus = 'completed' | 'draft' | 'partial';

@Entity('form_submission')
@Unique(['form_template_id', 'inspeccion_report_id'])
export class FormSubmission {
  @PrimaryGeneratedColumn()
  form_submission_id: number;

  @Column()
  form_template_id: number;

  @ManyToOne(() => FormTemplate, (template) => template.submissions, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'form_template_id' })
  formTemplate: FormTemplate;

  @Column()
  inspeccion_report_id: number;

  @ManyToOne(() => InspeccionReport, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspeccion_report_id' })
  inspeccionReport: InspeccionReport;

  @Column({ type: 'jsonb', default: {} })
  data: Record<string, any>;

  @Column({ type: 'varchar', length: 20, default: 'completed' })
  status: SubmissionStatus;

  @Column({ nullable: true })
  submitted_by: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'submitted_by' })
  submittedByUser: User;

  @CreateDateColumn()
  submitted_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => FormSubmissionHistory, (history) => history.submission)
  history: FormSubmissionHistory[];
}
