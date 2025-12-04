import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('inspeccion_maestro')
export class InspeccionMaestro {
  @PrimaryGeneratedColumn()
  maestro_id: number;

  @Column({ type: 'varchar', length: 50 })
  tipo: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  clave: string;

  @Column({ type: 'varchar', length: 255 })
  valor: string;

  @Column({ type: 'int', nullable: true })
  padre_id: number;

  @Column({ type: 'int', default: 0 })
  orden: number;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn()
  creado_en: Date;
}
