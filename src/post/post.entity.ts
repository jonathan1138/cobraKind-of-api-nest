import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, BaseEntity, BeforeUpdate } from 'typeorm';
import { PostType } from '../shared/enums/post-type.enum';
import { UserEntity } from '../user/entities/user.entity';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { Exchange } from 'src/exchange/exchange.entity';
import { UserIp } from 'src/user-ip-for-views/userIp.entity';
import { Market } from 'src/market/market.entity';
import { SubItem } from 'src/exchange-sub-item/sub-item.entity';

@Entity()
export class PostEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column('text', {nullable: true})
    description: string;

    @Column({ type: 'enum', enum: ListingStatus })
    status: ListingStatus;

    @Column({ type: 'enum', enum: PostType })
    postType: PostType;

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

    @ManyToOne(type => UserEntity, owner => owner.posts)
    owner: UserEntity;

    @ManyToOne(type => Exchange, exchange => exchange.posts, { eager: false } )
    exchange: Exchange;

    @ManyToOne(type => Market, market => market.posts, { eager: false } )
    market: Market;

    @ManyToOne(type => SubItem, subItem => subItem.posts, { eager: false } )
    subItem: SubItem;

    @ManyToMany(type => UserIp, { cascade: true })
    @JoinTable()
    userIpPosts: UserIp[];
}
