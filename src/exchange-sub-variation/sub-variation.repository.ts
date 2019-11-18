import { Repository, EntityRepository, EntityManager } from 'typeorm';
import { SubVariation } from './sub-variation.entity';
import { Logger, NotAcceptableException } from '@nestjs/common';

@EntityRepository(SubVariation)
export class SubVariationRepository extends Repository<SubVariation> {
    private logger = new Logger('SubVariationRepository');

    async allSubVariations(): Promise<SubVariation[]> {
        return await this.find();
    }

    async allMarkets(): Promise<SubVariation[]> {
        // return await this.find({select: ['name'], relations: ['exchanges']});
        return await this.createQueryBuilder('subVariation')
        .leftJoinAndSelect('subVariation.exchanges', 'exchange')
        .select(['subVariation.name', 'subVariation.marketId', 'exchange.id', 'exchange.name'])
        .getMany();
    }

    async exchangesBySubVariations(ids: string[]): Promise<SubVariation[]> {
        return await this.findByIds(ids, {select: ['name', 'marketId'], relations: ['exchanges']});
    }

    async subVariationsForMarket(id: string): Promise<SubVariation[]> {
        return this.createQueryBuilder('subVariation')
        .select(['subVariation.name', 'subVariation.marketId', 'exchange.id', 'exchange.name'])
        .innerJoin(
             'subVariation.exchanges',
             'exchange',
             'exchange.id = :exchangeId',
             { exchangeId: id },
        ).getMany();
    }

    async subVariationsByMarket(id: string): Promise<SubVariation[]> {
        const query = this.createQueryBuilder('subVariation');
        query.andWhere('subVariation.marketId = :id', { id });
        try {
            const found = await query.getMany();
            return found;
        } catch (error) {
           // this.logger.error(`Invalid SubVariation Supplied`, error.stack);
            throw new NotAcceptableException('Invalid Id Supplied');
        }
    }

    async subVariationsByName(name: string): Promise<SubVariation> {
        const query = this.createQueryBuilder('subVariation');
        query.andWhere('subVariation.name = :name', { name });
        try {
            const found = await query.getOne();
            return found;
        } catch (error) {
           // this.logger.error(`Invalid SubVariation Supplied`, error.stack);
            throw new NotAcceptableException('Invalid SubVariation Supplied');
        }
    }
}
