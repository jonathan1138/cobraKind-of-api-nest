import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Exchange } from 'src/exchange/exchange.entity';

@Entity()
export class PriceRatingInfo {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'money', nullable: true})
    bestBid: number;

    @Column({type: 'money', nullable: true})
    bestOffer: number;

    @Column({default: 0})
    numBids: number;

    @Column({default: 0})
    numOffers: number;

    @Column({default: 0})
    totalPrices: number;

    @Column({default: 0})
    averageRating: number;

    @Column({default: 0})
    numUpRatings: number;

    @Column({default: 0})
    numDownRatings: number;

    @Column({default: 0})
    totalRatings: number;

    @OneToOne(() => Exchange, exchange => exchange.priceRatingInfo)
    exchange: Exchange;
}
