import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ListingVote } from 'src/shared/enums/listing-vote.enum';

@Entity()
export class UserVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column({ type: 'enum', enum: ListingVote, nullable: true })
  status: ListingVote;

  @Column({nullable: true})
  voteComment: string;
}
