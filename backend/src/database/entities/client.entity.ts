import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Project } from './project.entity';

@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  client_id: number;

  @Column()
  name: string;

  @OneToMany(() => Project, (project) => project.client)
  projects: Project[];

}
