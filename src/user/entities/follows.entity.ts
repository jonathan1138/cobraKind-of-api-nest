import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('follows')
export class FollowsEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  followerId: string;

  @Column('uuid')
  followingId: string;
}
