import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { TagData } from '../shared/enums/tag-data.enum';
import { Market } from 'src/market/market.entity';

@Entity()
export class Tag {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true, type: 'enum', enum: TagData })
    name: TagData;

    @Column('uuid')
    categoryId: string;

    @ManyToMany(() => Market, (market: Market) => market.tags)
    @JoinTable()
    public markets: Market[];
}
