import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('support_file')
export class SupportFile {
  @PrimaryGeneratedColumn()
  support_file_id: number;

  @Column()
  name: string;

  @Column()
  display_name: string;

  @Column()
  category: string;

  @Column()
  file_path: string;

  @Column({ nullable: true })
  file_size: number;

  @Column({ nullable: true })
  mime_type: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_user_id' })
  created_by_user: User;
}