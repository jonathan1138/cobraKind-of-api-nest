import { EntityRepository, Repository } from 'typeorm';
import { Logger  } from '@nestjs/common';
import { PriceRatingInfo } from './price-rating-info.entity';

@EntityRepository(PriceRatingInfo)
export class PriceRatingInfoRepository extends Repository<PriceRatingInfo> {
    private logger = new Logger('PriceRatingInfoRepository');

    async incrementNumBids(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(PriceRatingInfo)
        .where({id})
        .set({ numBids: () => 'numBids + 1' })
        .execute();
    }

    async decrementNumBids(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(PriceRatingInfo)
        .where({id})
        .set({ numBids: () => 'numBids - 1' })
        .execute();
    }

    async incrementNumOffers(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(PriceRatingInfo)
        .where({id})
        .set({ numOffers: () => 'numOffers + 1' })
        .execute();
    }

    async decrementNumOffers(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(PriceRatingInfo)
        .where({id})
        .set({ numOffers: () => 'numOffers - 1' })
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
        .set({ numUpRatings: () => 'numUpRatings + 1' })
        .execute();
    }

    async decrementUpRatings(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(PriceRatingInfo)
        .where({id})
        .set({ numUpRatings: () => 'numUpRatings - 1' })
        .execute();
    }

    async incrementDownRatings(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(PriceRatingInfo)
        .where({id})
        .set({ numDownRatings: () => 'numDownRatings + 1' })
        .execute();
    }

    async decrementDownRatings(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(PriceRatingInfo)
        .where({id})
        .set({ numDownRatings: () => 'numDownRatings - 1' })
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
