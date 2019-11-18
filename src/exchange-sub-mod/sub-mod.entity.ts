import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne } from 'typeorm';
import { ListingStatus } from '../shared/enums/listing-status.enum';
import { Exchange } from 'src/exchange/exchange.entity';

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

    @Column('simple-array', { default: '' })
    images: string[];

    @Column({nullable: true})
    year: number;

    @Column({nullable: true})
    manufacturer: string;

    @Column({ default: 1 })
    likes: number;

    @Column({ default: 0 })
    views: number;

    @ManyToOne(type => Exchange, exchange => exchange.subMods, { eager: false } )
    exchange: Exchange;
}
