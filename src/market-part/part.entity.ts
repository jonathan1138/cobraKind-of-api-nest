import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, BaseEntity } from 'typeorm';
import { Market } from 'src/market/market.entity';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { Manufacturer } from 'src/exchange-manufacturer/manufacturer.entity';
import { YearCreated } from 'src/exchange-year/year.entity';

@Entity()
export class Part extends BaseEntity {
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

    @Column({ default: 1 })
    likes: number;

    @Column({ default: 0 })
    views: number;

    @ManyToOne(() => Market, market => market.parts, { eager: false } )
    market: Market;

    @ManyToOne(() => Manufacturer, manufacturer => manufacturer.parts, { eager: true } )
    manufacturer: Manufacturer;

    @ManyToOne(() => YearCreated, yearCreated => yearCreated.parts, { eager: true } )
    yearCreated: YearCreated;
}
