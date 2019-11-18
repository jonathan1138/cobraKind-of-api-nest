import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Unique,
     ManyToOne, ManyToMany, JoinTable, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { ListingStatus } from '../shared/enums/listing-status.enum';
import { Exchange } from 'src/exchange/exchange.entity';
import { UserEntity } from '../user/entities/user.entity';
import { UserIp } from 'src/user-ip-for-views/userIp.entity';
import { PriceRatingInfo } from 'src/exchange-price-rating-info/price-rating-info.entity';
import { PostEntity } from 'src/post/post.entity';

@Entity()
@Unique(['name'])
export class SubItem extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true})
    name: string;

    @Column('uuid')
    exchangeId: string;

    @Column({nullable: true})
    info: string;

    @Column({ type: 'enum', enum: ListingStatus })
    status: ListingStatus;

    @Column('simple-array', { default: '' })
    images: string[];

    @Column({nullable: true})
    year: number;

    @Column({nullable: true})
    manufacturer: string;

    @Column({ default: 1 })
    watchCount: number;

    @Column({ default: 0 })
    views: number;

    @Column({ default: 0 })
    likes: number;

    @ManyToOne(type => Exchange, exchange => exchange.subItems, { eager: false } )
    exchange: Exchange;

    @OneToMany(type => PostEntity, post => post.subItem, { eager: true })
    posts: PostEntity[];

    @ManyToMany(type => UserIp, { cascade: true })
    @JoinTable()
    userIpSubItems: UserIp[];

    @OneToOne(type => PriceRatingInfo, { // profile => profile.user,
        // onDelete: 'CASCADE', // this line does jack - nothing, but #3218 with typeorm
        // eager: true,
        cascade: ['insert', 'update' ],
    })
    @JoinColumn()
    subPriceRatingInfo: PriceRatingInfo;
}
