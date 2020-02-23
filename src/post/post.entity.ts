import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, BaseEntity, BeforeUpdate } from 'typeorm';
import { PostSide } from '../shared/enums/post-side.enum';
import { UserEntity } from '../user/entities/user.entity';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { Exchange } from 'src/market-exchange/exchange.entity';
import { UserIp } from 'src/user-ip-for-views/user-ip.entity';
import { Market } from 'src/market/market.entity';
import { SubItem } from 'src/exchange-subs/exchange-sub-item/sub-item.entity';
import { PostCondition } from 'src/shared/enums/post-condition.enum';
import { Part } from 'src/market-part/part.entity';
import { PostListingType } from 'src/shared/enums/post-listing-type.enum';

@Entity()
export class PostEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: PostListingType })
    public listingType: string;

    @Column('uuid')
    public ownerId!: string;

    @Column()
    title: string;

    @Column('text', {nullable: true})
    description: string;

    @Column({ type: 'enum', enum: PostCondition })
    condition: PostCondition;

    @Column({ type: 'enum', enum: ListingStatus })
    status: ListingStatus;

    @Column({nullable: true})
    statusNote: string;

    @Column({ type: 'enum', enum: PostSide })
    side: PostSide;

    @Column({type: 'money', nullable: true})
    price: number;

    @Column('simple-array', { default: '' })
    images: string[];

    @Column({ default: 0 })
    watchCount: number;

    @Column({ default: 0 })
    views: number;

    @Column({ type: 'geography', nullable: true, spatialFeatureType: 'Point', srid: 4326 })
    location: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    created: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    updated: Date;

    @BeforeUpdate()
    updateTimestamp() {
      // tslint:disable-next-line: new-parens
      this.updated = new Date;
    }

    @ManyToOne(() => UserEntity, owner => owner.posts, { cascade: true })
    owner: UserEntity;

    @ManyToOne(() => Market, market => market.posts, { eager: false } )
    market: Market;

    @ManyToOne(() => Exchange, exchange => exchange.posts, { eager: false } )
    exchange: Exchange;

    @ManyToOne(() => Part, part => part.posts, { eager: false } )
    part: Part;

    @ManyToOne(() => SubItem, subItem => subItem.posts, { eager: false } )
    subItem: SubItem;

    @ManyToMany(() => UserIp, { cascade: true })
    @JoinTable()
    userIpViews: UserIp[];
}
