import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './role.entity';

@Entity()
export class Access {
  @PrimaryGeneratedColumn()
  access_id: number;

  @Column()
  module_name: string;

  @Column()
  can_view: boolean;

  @Column()
  can_edit: boolean;

  @ManyToOne(() => Role, (role) => role.access)
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
