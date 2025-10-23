import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Document } from './document.entity';
import { User } from './user.entity';

@Entity('document_state_audit')
export class DocumentStateAudit {
  @PrimaryGeneratedColumn()
  audit_id: number;

  @Column()
  document_id: number;

  @Column({ type: 'varchar', length: 50 })
  previous_state: string;

  @Column({ type: 'varchar', length: 50 })
  new_state: string;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ nullable: true })
  changed_by_user_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  changed_by_email: string; // Para contratistas sin user_id

  @CreateDateColumn({ type: 'timestamp' })
  changed_at: Date;

  @Column({ type: 'int', nullable: true })
  time_in_previous_state_hours: number; // Tiempo en el estado anterior (en horas)

  @ManyToOne(() => Document, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document: Document;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'changed_by_user_id' })
  changed_by_user: User;
}
