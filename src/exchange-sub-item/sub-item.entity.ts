import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Unique,
     ManyToOne, ManyToMany, JoinTable, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { ListingStatus } from '../shared/enums/listing-status.enum';
import { Exchange } from 'src/exchange/exchange.entity';
import { UserEntity } from '../user/entities/user.entity';
import { UserIp } from 'src/user-ip-for-views/userIp.entity';
import { PriceRatingInfo } from 'src/exchange-price-rating-info/price-rating-info.entity';
import { PostEntity } from 'src/post/post.entity';
import { Manufacturer } from 'src/exchange-manufacturer/manufacturer.entity';
import { YearCreated } from 'src/exchange-year/year.entity';

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
    userIpSubItems: UserIp[];

    @OneToOne(() => PriceRatingInfo, { // profile => profile.user,
        // onDelete: 'CASCADE', // this line does jack - nothing, but #3218 with typeorm
        // eager: true,
        cascade: ['insert', 'update' ],
    })
    @JoinColumn()
    subPriceRatingInfo: PriceRatingInfo;

    @ManyToOne(() => Manufacturer, manufacturer => manufacturer.subItems, { eager: true } )
    manufacturer: Manufacturer;

    @ManyToOne(() => YearCreated, yearCreated => yearCreated.subItems, { eager: true } )
    yearCreated: YearCreated;
}
