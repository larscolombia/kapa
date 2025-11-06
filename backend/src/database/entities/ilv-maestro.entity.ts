import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ilv_maestro')
export class IlvMaestro {
  @PrimaryGeneratedColumn()
  maestro_id: number;

  @Column({ type: 'varchar', length: 100 })
  tipo: string;

  @Column({ type: 'varchar', length: 100 })
  clave: string;

  @Column({ type: 'varchar', length: 255 })
  valor: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ type: 'int', default: 0 })
  orden: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  aplica_a_tipo: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
