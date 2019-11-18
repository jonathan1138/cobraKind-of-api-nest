import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { Exchange } from 'src/exchange/exchange.entity';

@Entity()
export class Genre {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true})
    name: string;

    @Column('uuid')
    marketId: string;

    @ManyToMany(() => Exchange, (exchange: Exchange) => exchange.genres)
    @JoinTable()
    public exchanges: Exchange[];
}
