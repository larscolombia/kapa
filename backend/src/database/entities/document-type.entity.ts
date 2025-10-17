import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Criterion } from './criterion.entity';

@Entity()
export class DocumentType {
  @PrimaryGeneratedColumn()
  type_id: number;

  @Column()
  name: string;

  @OneToMany(() => Criterion, (criterion) => criterion.documentType)
  criteria: Criterion[];
}
