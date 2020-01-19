import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne } from 'typeorm';
import { ListingStatus } from '../shared/enums/listing-status.enum';
import { Exchange } from 'src/exchange/exchange.entity';
import { Manufacturer } from 'src/exchange-manufacturer/manufacturer.entity';
import { CreatedYear } from 'src/exchange-year/year.entity';

@Entity()
@Unique(['name'])
export class SubMod extends BaseEntity {
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
    likes: number;

    @Column({ default: 0 })
    views: number;

    @ManyToOne(() => Exchange, exchange => exchange.subMods, { eager: false } )
    exchange: Exchange;

    @ManyToOne(() => Manufacturer, manufacturer => manufacturer.subMods, { eager: true, cascade: true } )
    manufacturer: Manufacturer;

    @ManyToOne(() => CreatedYear, createdYear => createdYear.subMods, { eager: true, cascade: true } )
    createdYear: CreatedYear;
}
