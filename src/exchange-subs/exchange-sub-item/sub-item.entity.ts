import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Unique,
     ManyToOne, ManyToMany, JoinTable, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { ListingStatus } from '../../shared/enums/listing-status.enum';
import { Exchange } from 'src/market-exchange/exchange.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { UserIp } from 'src/user-ip-for-views/user-ip.entity';
import { PriceRatingInfo } from 'src/exchange-price-rating-info/price-rating-info.entity';
import { PostEntity } from 'src/post/post.entity';
import { Manufacturer } from 'src/manufacturer/manufacturer.entity';
import { CreatedYear } from 'src/created-year/year.entity';

@Entity()
export class SubItem extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column('uuid')
    exchangeId: string;

    @Column({nullable: true})
    info: string;

    @Column({ type: 'enum', enum: ListingStatus })
    status: ListingStatus;

    @Column({nullable: true})
    statusNote: string;

    @Column('simple-array', { default: '' })
    images: string[];

    @Column({ default: 1 })
    watchCount: number;

    @Column({ default: 0 })
    views: number;

    @Column({ default: 0 })
    likes: number;

    @ManyToOne(() => Exchange, exchange => exchange.subItems, { eager: false } )
    exchange: Exchange;

    @OneToMany(() => PostEntity, post => post.subItem, { eager: true })
    posts: PostEntity[];

    @ManyToMany(() => UserIp, { cascade: true })
    @JoinTable()
    userIpViews: UserIp[];

    @OneToOne(() => PriceRatingInfo, { // profile => profile.user,
        // onDelete: 'CASCADE', // this line does jack - nothing, but #3218 with typeorm
        // eager: true,
        cascade: ['insert', 'update' ],
    })
    @JoinColumn()
    priceRatingInfo: PriceRatingInfo;

    @ManyToOne(() => Manufacturer, manufacturer => manufacturer.subItems, { eager: true } )
    manufacturer: Manufacturer;

    @ManyToOne(() => CreatedYear, createdYear => createdYear.subItems, { eager: true } )
    createdYear: CreatedYear;
}
