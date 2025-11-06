import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { IlvReport } from './ilb-report.entity';
import { User } from './user.entity';

@Entity('ilv_attachment')
export class IlvAttachment {
  @PrimaryGeneratedColumn()
  attachment_id: number;

  @Column()
  report_id: number;

  @ManyToOne(() => IlvReport, report => report.attachments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report: IlvReport;

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
  uploader: User;

  @CreateDateColumn()
  created_at: Date;
}
