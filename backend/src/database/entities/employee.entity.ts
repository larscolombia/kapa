import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ProjectContractor } from './project-contractor.entity';
import { Document } from './document.entity';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  employee_id: number;

  @ManyToOne(
    () => ProjectContractor,
    (projectContractor) => projectContractor.employees,
  )
  @JoinColumn({ name: 'project_contractor_id' })
  projectContractor: ProjectContractor;

  @Column()
  identification: string;

  @Column()
  name: string;

  @Column()
  position: string;

  @OneToMany(() => Document, (document) => document.employee, {
    nullable: true,
  })
  documents?: Document[];
}
