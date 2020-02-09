import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Exchange } from 'src/market-exchange/exchange.entity';

@Entity()
export class PriceRatingInfo {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'money', nullable: true})
    bestBid: number;

    @Column({type: 'money', nullable: true})
    bestOffer: number;

    @Column({default: 0})
    totalBids: number;

    @Column({default: 0})
    totalOffers: number;

    @Column({default: 0})
    totalPrices: number;

    @Column({default: 0})
    averageRating: number;

    @Column({default: 0})
    totalUpRatings: number;

    @Column({default: 0})
    totalDownRatings: number;

    @Column({default: 0})
    totalRatings: number;

    @OneToOne(() => Exchange, exchange => exchange.priceRatingInfo)
    exchange: Exchange;
}
