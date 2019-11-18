import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToMany, JoinTable } from 'typeorm';
import { Exchange } from 'src/exchange/exchange.entity';

@Entity()
@Unique(['name'])
export class SubVariation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true})
    name: string;

    @Column('uuid')
    marketId: string;

    @ManyToMany(() => Exchange, (exchange: Exchange) => exchange.subVariations)
    @JoinTable()
    public exchanges: Exchange[];
}
