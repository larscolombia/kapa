import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Subcriterion } from './subcriterion.entity';
import { DocumentType } from './document-type.entity';
import { ProjectContractorCriterion } from './project-contractor-criterion.entity';

@Entity()
export class Criterion {
  @PrimaryGeneratedColumn()
  criterion_id: number;

  @Column()
  name: string;

  @OneToMany(() => Subcriterion, (subcriterion) => subcriterion.criterion)
  subcriteria: Subcriterion[];

  @ManyToOne(() => DocumentType, (documentType) => documentType.criteria, {
    eager: true,
  })
  @JoinColumn({ name: 'document_type_id' })
  documentType: DocumentType;

  @OneToMany(() => ProjectContractorCriterion, (projectContractorCriterion) => projectContractorCriterion.criterion)
  projectContractorCriterions: ProjectContractorCriterion[];
}
