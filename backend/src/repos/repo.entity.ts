import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Repo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  githubId: number;

  @Column()
  name: string;

  @Column()
  owner: string;

  @Column()
  stars: number;

  @Column({ default: false })
  processed: boolean;
}
