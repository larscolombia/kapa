import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { InspeccionReport } from './inspeccion-report.entity';

@Entity('inspeccion_report_field')
export class InspeccionReportField {
  @PrimaryGeneratedColumn()
  field_id: number;

  @Column()
  report_id: number;

  @ManyToOne(() => InspeccionReport, report => report.fields, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report: InspeccionReport;

  @Column({ type: 'varchar', length: 100 })
  key: string;

  @Column({ type: 'text', nullable: true })
  value: string;

  @Column({ type: 'varchar', length: 20, default: 'string' })
  value_type: string;

  // Propiedad virtual para almacenar el nombre legible del maestro
  // Se inicializa vacía para asegurar que se serialice en JSON
  value_display: string = '';
}
