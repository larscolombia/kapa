import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Client } from './client.entity';
import { ProjectContractor } from './project-contractor.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  project_id: number;

  @Column()
  name: string;

  @ManyToOne(() => Client, (client) => client.projects, { eager: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column()
  address: string;

  @Column()
  supervisor: string;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ type: 'enum', enum: ['active', 'inactive'] })
  state: string;

  @OneToMany(() => ProjectContractor, (projectContractor) => projectContractor.project)
  projectContractors: ProjectContractor[];
}
