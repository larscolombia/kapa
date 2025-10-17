import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Criterion } from './criterion.entity';
import { Document } from './document.entity';

@Entity()
export class Subcriterion {
  @PrimaryGeneratedColumn()
  subcriterion_id: number;

  @Column()
  name: string;

  @Column()
  multiple_required: boolean;

  @Column()
  employee_required: boolean;

  @Column({ nullable: true })
  order: number;

  @ManyToOne(() => Criterion, (criterion) => criterion.subcriteria, {
    eager: true,
  })
  @JoinColumn({ name: 'criterion_id' })
  criterion: Criterion;

  @OneToMany(() => Document, (document) => document.subcriterion)
  documents: Document[];

  @Column({ type: 'boolean', default: false })
  hasExpirationDate: boolean;
}
