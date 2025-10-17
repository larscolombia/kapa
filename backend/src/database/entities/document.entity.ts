import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProjectContractor } from './project-contractor.entity';
import { Employee } from './employee.entity';
import { Subcriterion } from './subcriterion.entity';

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  document_id: number;

  @Column()
  name: string;

  @ManyToOne(
    () => ProjectContractor,
    (projectContractor) => projectContractor.documents,
    { eager: true },
  )
  @JoinColumn({ name: 'project_contractor_id' })
  projectContractor: ProjectContractor;

  @ManyToOne(() => Employee, (employee) => employee.documents, {
    nullable: true,
  })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @ManyToOne(() => Subcriterion, (subcriterion) => subcriterion.documents, {
    eager: true,
  })
  @JoinColumn({ name: 'subcriterion_id' })
  subcriterion: Subcriterion;

  @Column()
  comments: string;

  @Column({
    type: 'enum',
    enum: [
      'not_submitted',
      'submitted',
      'approved',
      'rejected',
      'not_applicable',
      'for_adjustment',
    ],
  })
  state: string;

  @Column({ type: 'date', nullable: true })
  startDate: Date; // Fecha de Inicio de Vigencia

  @Column({ type: 'date', nullable: true })
  endDate: Date; // Fecha Final de Vigencia
}
