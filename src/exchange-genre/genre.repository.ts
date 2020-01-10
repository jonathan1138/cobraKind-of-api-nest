import { Repository, EntityRepository } from 'typeorm';
import { Genre } from './genre.entity';
import { Logger, NotAcceptableException } from '@nestjs/common';

@EntityRepository(Genre)
export class GenreRepository extends Repository<Genre> {
    private logger = new Logger('GenreRepository');

    async allGenres(page: number = 1): Promise<Genre[]> {
        if (page > 0) {
            return await this.find({
                order: {
                    name: 'ASC',
                },
                take: 50,
                skip: 50 * (page - 1),
            });
        } else {
            return await this.find({
                order: {
                    name: 'ASC',
                },
            });
        }
    }

    async allExchanges(): Promise<Genre[]> {
        // return await this.find({select: ['name'], relations: ['exchanges']});
        return await this.createQueryBuilder('genre')
        .leftJoinAndSelect('genre.exchanges', 'exchange')
        .select(['genre.name', 'genre.marketId', 'exchange.id', 'exchange.name'])
        .getMany();
    }

    async exchangesByGenres(ids: string[]): Promise<Genre[]> {
        return await this.findByIds(ids, {select: ['name', 'marketId'], relations: ['exchanges']});
    }

    async genresForExchange(id: string): Promise<Genre[]> {
        return this.createQueryBuilder('genre')
        .select(['genre.name', 'genre.marketId', 'exchange.id', 'exchange.name'])
        .innerJoin(
             'genre.exchanges',
             'exchange',
             'exchange.id = :exchangeId',
             { exchangeId: id },
        ).getMany();
    }

    async genresByMarket(id: string): Promise<Genre[]> {
        const query = this.createQueryBuilder('genre');
        query.andWhere('genre.marketId = :id', { id });
        try {
            const found = await query.getMany();
            return found;
        } catch (error) {
           // this.logger.error(`Invalid Genre Supplied`, error.stack);
            throw new NotAcceptableException('Invalid Id Supplied');
        }
    }

    async genresByName(name: string): Promise<Genre> {
        const query = this.createQueryBuilder('genre');
        query.andWhere('genre.name = :name', { name });
        try {
            const found = await query.getOne();
            return found;
        } catch (error) {
           // this.logger.error(`Invalid Genre Supplied`, error.stack);
            throw new NotAcceptableException('Invalid Genre Supplied');
        }
    }
}
