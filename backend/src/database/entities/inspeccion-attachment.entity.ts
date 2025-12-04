import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { InspeccionReport } from './inspeccion-report.entity';
import { User } from './user.entity';

@Entity('inspeccion_attachment')
export class InspeccionAttachment {
  @PrimaryGeneratedColumn()
  attachment_id: number;

  @Column()
  report_id: number;

  @ManyToOne(() => InspeccionReport, report => report.attachments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report: InspeccionReport;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @Column({ type: 'varchar', length: 500 })
  s3_key: string;

  @Column({ type: 'varchar', length: 100 })
  mime_type: string;

  @Column({ type: 'bigint' })
  size_bytes: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  file_hash: string;

  @Column()
  created_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn()
  created_at: Date;
}
