import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { FormSubmission } from './form-submission.entity';
import { User } from './user.entity';

@Entity('form_submission_history')
export class FormSubmissionHistory {
  @PrimaryGeneratedColumn()
  history_id: number;

  @Column()
  form_submission_id: number;

  @ManyToOne(() => FormSubmission, (submission) => submission.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'form_submission_id' })
  submission: FormSubmission;

  @Column({ type: 'jsonb' })
  previous_data: Record<string, any>;

  @Column({ type: 'jsonb' })
  new_data: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  changed_fields: string[];

  @Column({ nullable: true })
  changed_by: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'changed_by' })
  changedByUser: User;

  @Column({ type: 'varchar', length: 500, nullable: true })
  change_reason: string;

  @CreateDateColumn()
  changed_at: Date;
}
