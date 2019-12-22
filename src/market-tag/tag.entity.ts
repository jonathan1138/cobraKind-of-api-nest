import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable, BaseEntity } from 'typeorm';
import { Market } from 'src/market/market.entity';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';

@Entity()
export class Tag extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true})
    name: string;

    @Column('uuid')
    categoryId: string;

    @Column({ type: 'enum', enum: ListingStatus })
    status: ListingStatus;

    @ManyToMany(() => Market, (market: Market) => market.tags)
    @JoinTable()
    public markets: Market[];
}
