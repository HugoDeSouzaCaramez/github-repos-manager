import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Job {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  filePath: string;
  
  @Column({ default: 'pending' })
  status: 'pending' | 'processing' | 'completed' | 'failed';
}
