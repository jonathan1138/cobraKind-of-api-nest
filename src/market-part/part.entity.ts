import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, BaseEntity } from 'typeorm';
import { Market } from 'src/market/market.entity';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';

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

    @Column('simple-array', { default: '' })
    images: string[];

    @Column({nullable: true})
    year: number;

    @Column()
    manufacturer: string;

    @Column({ default: 1 })
    likes: number;

    @Column({ default: 0 })
    views: number;

    @ManyToOne(type => Market, market => market.parts, { eager: false } )
    market: Market;
}
