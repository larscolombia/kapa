import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ProjectContractor } from './project-contractor.entity';
import { Criterion } from './criterion.entity';

@Entity()
export class ProjectContractorCriterion {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ProjectContractor, (projectContractor) => projectContractor.projectContractorCriterions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'project_contractor_id' })
    projectContractor: ProjectContractor;

    @ManyToOne(() => Criterion, (criterion) => criterion.projectContractorCriterions)
    @JoinColumn({ name: 'criterion_id' })
    criterion: Criterion;

    @Column({ nullable: true })
    completion_percentage: number;
}
