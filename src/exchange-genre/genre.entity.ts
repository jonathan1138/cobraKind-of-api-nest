import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable, BaseEntity } from 'typeorm';
import { Exchange } from 'src/exchange/exchange.entity';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { Market } from 'src/market/market.entity';

@Entity()
export class Genre extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true})
    name: string;

    @Column({ type: 'enum', enum: ListingStatus })
    status: ListingStatus;

    @Column({nullable: true})
    statusNote: string;

    @ManyToMany(() => Exchange, (exchange: Exchange) => exchange.genres)
    @JoinTable()
    public exchanges: Exchange[];

    @ManyToMany(() => Market, (market: Market) => market.genres, {
        nullable: true,
      })
    @JoinTable()
    public markets: Market[];
}
