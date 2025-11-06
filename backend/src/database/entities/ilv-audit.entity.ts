import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('ilv_audit')
export class IlvAudit {
  @PrimaryGeneratedColumn()
  audit_id: number;

  @Column({ type: 'varchar', length: 50 })
  entidad: string;

  @Column()
  entidad_id: number;

  @Column({ type: 'varchar', length: 50 })
  accion: string;

  @Column({ nullable: true })
  actor_id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'actor_id' })
  actor: User;

  @Column({ type: 'jsonb', nullable: true })
  diff_json: any;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @CreateDateColumn()
  created_at: Date;
}
