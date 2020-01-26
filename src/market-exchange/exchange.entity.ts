import { BaseEntity, Entity, PrimaryGeneratedColumn, Column,
  Unique, ManyToOne, ManyToMany, OneToMany, JoinTable, OneToOne, JoinColumn } from 'typeorm';
import { ListingStatus } from '../shared/enums/listing-status.enum';
import { Market } from 'src/market/market.entity';
import { Genre } from 'src/exchange-genre/genre.entity';
import { SubItem } from 'src/exchange-subs/exchange-sub-item/sub-item.entity';
import { SubMod } from 'src/exchange-subs/exchange-sub-mod/sub-mod.entity';
import { SubVariation } from 'src/exchange-subs/exchange-sub-variation/sub-variation.entity';
import { PostEntity } from '../post/post.entity';
import { UserIp } from 'src/user-ip-for-views/user-ip.entity';
import { ListingRating } from '../exchange-listing-rating/listing-rating.entity';
import { PriceRatingInfo } from '../exchange-price-rating-info/price-rating-info.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { CreatedYear } from 'src/created-year/year.entity';

@Entity()
@Unique(['name'])
export class Exchange extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true})
    name: string;

    @Column('uuid')
    marketId: string;

    @Column({nullable: true})
    info: string;

    @Column({ type: 'enum', enum: ListingStatus })
    status: ListingStatus;

    @Column({nullable: true})
    statusNote: string;

    @Column('simple-array', { default: '' })
    images: string[];

    @Column({ default: 0 })
    watchCount: number;

    @Column({ default: 0 })
    views: number;

    @Column({ default: 0 })
    likes: number;

    @OneToMany(() => PostEntity, post => post.exchange, { eager: true })
    posts: PostEntity[];

    @ManyToOne(() => Market, market => market.exchanges, { eager: false } )
    market: Market;

    @ManyToMany(() => Genre, (genre: Genre) => genre.exchanges, {
      nullable: true,
      cascade: true,
    })
    public genres: Genre[];

    @ManyToMany(() => SubVariation, (subVariation: SubVariation) => subVariation.exchanges, {
      nullable: true,
      cascade: true,
    })
    public subVariations: SubVariation[];

    @OneToMany(() => SubItem, subItem => subItem.exchange, { eager: false })
    subItems: SubItem[];

    @OneToMany(() => SubMod, subMod => subMod.exchange, { eager: false })
    subMods: SubMod[];

    @ManyToMany(() => UserIp, { cascade: true })
    @JoinTable()
    userIpViews: UserIp[];

    @OneToMany(() => ListingRating, (listingRating) => listingRating.exchange)
    public listingRatings!: ListingRating[];

    @OneToOne(() => PriceRatingInfo, { // profile => profile.user,
      // onDelete: 'CASCADE', // this line does jack - nothing, but #3218 with typeorm
      // eager: true,
      cascade: ['insert', 'update' ],
    })
    @JoinColumn()
    priceRatingInfo: PriceRatingInfo;

    @ManyToOne(() => Manufacturer, manufacturer => manufacturer.exchanges, { eager: true, cascade: true } )
    manufacturer: Manufacturer;

    @ManyToOne(() => CreatedYear, createdYear => createdYear.exchanges, { eager: true, cascade: true } )
    createdYear: CreatedYear;
}
