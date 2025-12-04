import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Project } from './project.entity';
import { Client } from './client.entity';
import { Contractor } from './contractor.entity';
import { InspeccionReportField } from './inspeccion-report-field.entity';
import { InspeccionAttachment } from './inspeccion-attachment.entity';

@Entity('inspeccion_report')
export class InspeccionReport {
  @PrimaryGeneratedColumn()
  report_id: number;

  @Column({ type: 'varchar', length: 20 })
  tipo: string; // 'tecnica' | 'auditoria'

  @Column({ type: 'date', nullable: true })
  fecha: Date;

  @Column()
  cliente_id: number;

  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn({ name: 'cliente_id' })
  client: Client;

  @Column()
  proyecto_id: number;

  @ManyToOne(() => Project, { nullable: true })
  @JoinColumn({ name: 'proyecto_id' })
  project: Project;

  @Column({ nullable: true })
  empresa_id: number;

  @ManyToOne(() => Contractor, { nullable: true })
  @JoinColumn({ name: 'empresa_id' })
  contractor: Contractor;

  @Column({ nullable: true })
  empresa_auditada_id: number;

  @ManyToOne(() => Contractor, { nullable: true })
  @JoinColumn({ name: 'empresa_auditada_id' })
  empresa_auditada: Contractor;

  @Column({ type: 'varchar', length: 20, default: 'abierto' })
  estado: string; // 'abierto' | 'cerrado'

  @Column({ type: 'text', nullable: true })
  observacion: string;

  @Column({ nullable: true })
  creado_por: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'creado_por' })
  created_by: User;

  @Column()
  propietario_user_id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'propietario_user_id' })
  owner: User;

  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn({ nullable: true })
  actualizado_en: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_cierre: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @OneToMany(() => InspeccionReportField, field => field.report, { cascade: true })
  fields: InspeccionReportField[];

  @OneToMany(() => InspeccionAttachment, attachment => attachment.report, { cascade: true })
  attachments: InspeccionAttachment[];
}
