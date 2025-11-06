import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { IlvReport } from './ilb-report.entity';

@Entity('ilv_email_log')
export class IlvEmailLog {
  @PrimaryGeneratedColumn()
  log_id: number;

  @Column({ nullable: true })
  report_id: number;

  @ManyToOne(() => IlvReport, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'report_id' })
  report: IlvReport;

  @Column({ type: 'varchar', length: 255 })
  to_addr: string;

  @Column({ type: 'varchar', length: 500 })
  subject: string;

  @Column({ type: 'text', nullable: true })
  payload: string;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  sent_at: Date;
}
