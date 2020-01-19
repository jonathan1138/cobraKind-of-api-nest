import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;
}
