import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, BaseEntity, ManyToMany, JoinTable } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { Exchange } from '../market-exchange/exchange.entity';
import { PostType } from '../shared/enums/post-type.enum';

@Entity()
export class ListingRating extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: PostType })
    listingRatingType: PostType;

    @Column('uuid')
    public exchangeId!: string;

    @Column('uuid')
    public userId!: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    created: Date;

    @Column('text', {nullable: true})
    comment: string;

    @Column({default: 0 })
    rating: number;

    @Column({ default: 0 })
    likes: number;

    @ManyToOne(() => Exchange, exchange => exchange.listingRatings, { eager: false })
    public exchange!: Exchange;

    @ManyToOne(() => UserEntity, user => user.listingRatings, { eager: false })
    public user!: UserEntity;

    @ManyToMany(() => UserEntity, { cascade: true })
    @JoinTable()
    commentLikes: UserEntity[];
}
