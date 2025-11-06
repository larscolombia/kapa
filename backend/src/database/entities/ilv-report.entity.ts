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
import { IlvReportField } from './ilv-report-field.entity';
import { IlvAttachment } from './ilv-attachment.entity';

@Entity('ilv_report')
export class IlvReport {
  @PrimaryGeneratedColumn()
  report_id: number;

  @Column({ type: 'varchar', length: 50 })
  tipo: string; // 'hazard_id' | 'wit' | 'swa' | 'fdkar'

  @Column({ type: 'varchar', length: 20, default: 'abierto' })
  estado: string; // 'abierto' | 'cerrado'

  @Column({ nullable: true })
  centro_id: number;

  @Column({ nullable: true })
  proyecto_id: number;

  @ManyToOne(() => Project, { nullable: true })
  @JoinColumn({ name: 'proyecto_id' })
  project: Project;

  @Column({ nullable: true })
  cliente_id: number;

  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn({ name: 'cliente_id' })
  client: Client;

  @Column({ nullable: true })
  empresa_id: number; // Contratista/Subcontratista responsable

  @ManyToOne(() => Contractor, { nullable: true })
  @JoinColumn({ name: 'empresa_id' })
  contractor: Contractor;

  @Column()
  creado_por: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creado_por' })
  created_by: User;

  @Column({ nullable: true })
  propietario_user_id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'propietario_user_id' })
  owner: User;

  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_cierre: Date;

  @Column({ nullable: true })
  cerrado_por: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'cerrado_por' })
  closed_by: User;

  @OneToMany(() => IlvReportField, field => field.report, { cascade: true })
  fields: IlvReportField[];

  @OneToMany(() => IlvAttachment, attachment => attachment.report, { cascade: true })
  attachments: IlvAttachment[];
}
