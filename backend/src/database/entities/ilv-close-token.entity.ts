import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { IlvReport } from './ilb-report.entity';

@Entity('ilv_close_token')
export class IlvCloseToken {
  @PrimaryGeneratedColumn()
  token_id: number;

  @Column()
  report_id: number;

  @ManyToOne(() => IlvReport, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report: IlvReport;

  @Column({ nullable: true })
  empresa_id: number;

  @Column({ type: 'varchar', length: 500, unique: true })
  jwt_id: string;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  used_at: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  used_ip: string;

  @Column({ type: 'text', nullable: true })
  used_user_agent: string;

  @CreateDateColumn()
  created_at: Date;
}
