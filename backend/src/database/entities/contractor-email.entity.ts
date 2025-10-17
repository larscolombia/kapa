import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Contractor } from './contractor.entity';

@Entity()
export class ContractorEmail {
  @PrimaryColumn()
  email: string;

  @PrimaryColumn()
  contractor_id: number;

  @ManyToOne(() => Contractor, (contractor) => contractor.emails)
  @JoinColumn({ name: 'contractor_id' })
  contractor: Contractor;
}
