import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, BeforeInsert, Unique, Generated, OneToMany } from 'typeorm';
import { ListingStatus } from '../shared/enums/listing-status.enum';
import { Market } from 'src/market/market.entity';

@Entity()
@Unique(['name'])
export class Category extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true})
    name: string;

    @Column({nullable: true})
    info: string;

    @Column({ type: 'enum', enum: ListingStatus })
    status: ListingStatus;

    @Column('simple-array', { default: '' })
    images: string[];

    @OneToMany(type => Market, market => market.category, { eager: true })
    markets: Market[];
}
