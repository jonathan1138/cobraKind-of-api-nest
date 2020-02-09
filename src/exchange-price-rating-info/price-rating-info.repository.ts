import { EntityRepository, Repository } from 'typeorm';
import { Logger  } from '@nestjs/common';
import { PriceRatingInfo } from './price-rating-info.entity';

@EntityRepository(PriceRatingInfo)
export class PriceRatingInfoRepository extends Repository<PriceRatingInfo> {
    private logger = new Logger('PriceRatingInfoRepository');

    async incrementTotalBids(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(PriceRatingInfo)
        .where({id})
        .set({ totalBids: () => 'totalBids + 1' })
        .execute();
    }

    async decrementTotalBids(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(PriceRatingInfo)
        .where({id})
        .set({ totalBids: () => 'totalBids - 1' })
        .execute();
    }

    async incrementTotalOffers(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(PriceRatingInfo)
        .where({id})
        .set({ totalOffers: () => 'totalOffers + 1' })
        .execute();
    }

    async decrementTotalOffers(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(PriceRatingInfo)
        .where({id})
        .set({ totalOffers: () => 'totalOffers - 1' })
        .execute();
    }

    async incrementTotalPrices(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(PriceRatingInfo)
        .where({id})
        .set({ totalPrices: () => 'totalPrices + 1' })
        .execute();
    }

    async decrementTotalPrices(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(PriceRatingInfo)
        .where({id})
        .set({ totalPrices: () => 'totalPrices - 1' })
        .execute();
    }

    async incrementUpRatings(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(PriceRatingInfo)
        .where({id})
        .set({ totalUpRatings: () => 'totalUpRatings + 1' })
        .execute();
    }

    async decrementUpRatings(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(PriceRatingInfo)
        .where({id})
        .set({ totalUpRatings: () => 'totalUpRatings - 1' })
        .execute();
    }

    async incrementDownRatings(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(PriceRatingInfo)
        .where({id})
        .set({ totalDownRatings: () => 'totalDownRatings + 1' })
        .execute();
    }

    async decrementDownRatings(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(PriceRatingInfo)
        .where({id})
        .set({ totalDownRatings: () => 'totalDownRatings - 1' })
        .execute();
    }

    async incrementTotalRatings(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(PriceRatingInfo)
        .where({id})
        .set({ totalRatings: () => 'totalRatings + 1' })
        .execute();
    }

    async decrementTotalRatings(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(PriceRatingInfo)
        .where({id})
        .set({ totalRatings: () => 'totalRatings - 1' })
        .execute();
    }
}
