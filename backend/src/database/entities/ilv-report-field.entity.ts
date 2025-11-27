import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { IlvReport } from './ilv-report.entity';

@Entity('ilv_report_field')
export class IlvReportField {
  @PrimaryGeneratedColumn()
  field_id: number;

  @Column()
  report_id: number;

  @ManyToOne(() => IlvReport, report => report.fields, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report: IlvReport;

  @Column({ type: 'varchar', length: 100 })
  key: string;

  @Column({ type: 'text', nullable: true })
  value: string;

  @Column({ type: 'varchar', length: 50, default: 'string' })
  value_type: string;

  @Column({ type: 'varchar', length: 50, default: 'manual' })
  source: string;

  @CreateDateColumn()
  created_at: Date;

  // Propiedad virtual para almacenar el nombre legible del maestro
  value_display?: string;
}
