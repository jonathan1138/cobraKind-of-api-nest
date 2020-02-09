import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, BaseEntity, ManyToMany, JoinTable, JoinColumn, OneToOne } from 'typeorm';
import { Market } from 'src/market/market.entity';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { Manufacturer } from 'src/manufacturer/manufacturer.entity';
import { CreatedYear } from 'src/created-year/year.entity';
import { Exchange } from 'src/market-exchange/exchange.entity';
import { UserIp } from 'src/user-ip-for-views/user-ip.entity';
import { PriceRatingInfo } from 'src/exchange-price-rating-info/price-rating-info.entity';

@Entity()
export class Part extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
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

    @Column({ default: 1 })
    likes: number;

    @Column({ default: 0 })
    views: number;

    @ManyToOne(() => Market, market => market.parts, { eager: true, cascade: true } )
    market: Market;

    @ManyToMany(() => Exchange, (exchange: Exchange) => exchange.parts, {
        nullable: true,
      })
    @JoinTable()
    public exchanges: Exchange[];

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

    @ManyToOne(() => Manufacturer, manufacturer => manufacturer.parts, { eager: true, cascade: true } )
    manufacturer: Manufacturer;

    @ManyToOne(() => CreatedYear, createdYear => createdYear.parts, { eager: true, cascade: true } )
    createdYear: CreatedYear;
}
