import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProjectContractor } from './project-contractor.entity';
import { ContractorEmail } from './contractor-email.entity';

@Entity()
export class Contractor {
  @PrimaryGeneratedColumn()
  contractor_id: number;

  @Column()
  nit: string;

  @Column()
  name: string;

  @Column()
  resident_engineer: string;

  @Column()
  coordinator: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  parent_contractor: number;

  @Column({ type: 'enum', enum: ['active', 'inactive'] })
  state: string;

  @OneToMany(() => ProjectContractor, (projectContractor) => projectContractor.contractor, { cascade: true, onDelete: 'CASCADE', eager: true })
  projectContractors: ProjectContractor[];

  @OneToMany(() => ContractorEmail, (contractorEmail) => contractorEmail.contractor, { cascade: true, onDelete: 'CASCADE', eager: true })
  emails: ContractorEmail[];
}
