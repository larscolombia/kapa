import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Column,
} from 'typeorm';
import { Project } from './project.entity';
import { Contractor } from './contractor.entity';
import { Employee } from './employee.entity';
import { Document } from './document.entity';
import { ProjectContractorCriterion } from './project-contractor-criterion.entity';

@Entity()
export class ProjectContractor {
  @PrimaryGeneratedColumn()
  project_contractor_id: number;

  @Column({ nullable: true })
  completition_percentage: number;

  @ManyToOne(() => Project, (project) => project.projectContractors, { eager: true })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => Contractor, (contractor) => contractor.projectContractors)
  @JoinColumn({ name: 'contractor_id' })
  contractor: Contractor;

  @OneToMany(() => Employee, (employee) => employee.projectContractor)
  employees: Employee[];

  @OneToMany(() => Document, (document) => document.projectContractor)
  documents: Document[];

  @OneToMany(() => ProjectContractorCriterion, (projectContractorCriterion) => projectContractorCriterion.projectContractor)
  projectContractorCriterions: ProjectContractorCriterion[];
}
