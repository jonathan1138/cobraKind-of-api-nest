import { Repository, EntityRepository } from 'typeorm';
import { Genre } from './genre.entity';
import { Logger, NotAcceptableException, InternalServerErrorException, ConflictException, NotFoundException } from '@nestjs/common';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { CreateGenreDto } from './dto/create-genre-dto';
import { Market } from 'src/market/market.entity';

@EntityRepository(Genre)
export class GenreRepository extends Repository<Genre> {
    private logger = new Logger('GenreRepository');

    // async getGenres(page: number = 1): Promise<Genre[]> {
    //     if (page > 0) {
    //         return await this.find({
    //             order: {
    //                 name: 'ASC',
    //             },
    //             take: 50,
    //             skip: 50 * (page - 1),
    //         });
    //     } else {
    //         return await this.find({
    //             order: {
    //                 name: 'ASC',
    //             },
    //         });
    //     }
    // }
    // async exchangesByGenres(ids: string[]): Promise<Genre[]> {
    //     return await this.findByIds(ids, {select: ['name', 'marketId'], relations: ['exchanges']});
    // }

    async getGenres(page: number = 1): Promise<Genre[]> {
        // return await this.find({select: ['name'], relations: ['exchanges']});
        const query = this.createQueryBuilder('genre')
        .leftJoinAndSelect('genre.exchanges', 'exchange')
        .leftJoinAndSelect('genre.markets', 'market')
        .select(['genre', 'market.id', 'market.name', 'exchange.id', 'exchange.name']);
        if (page > 0) {
            query.take(15);
            query.skip(15 * (page - 1));
        }
        return await query.orderBy('genre.name', 'ASC').getMany();
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
        const query = this.createQueryBuilder('genre')
        .andWhere('genre.marketId = :id', { id });
        try {
            const found = await query.getMany();
            return found;
        } catch (error) {
           // this.logger.error(`Invalid Genre Supplied`, error.stack);
            throw new NotAcceptableException('Invalid Id Supplied');
        }
    }

    async genresByName(name: string): Promise<Genre> {
        const query = this.createQueryBuilder('genre')
        .andWhere('genre.name = :name', { name });
        try {
            const found = await query.getOne();
            return found;
        } catch (error) {
           // this.logger.error(`Invalid Genre Supplied`, error.stack);
            throw new NotAcceptableException('Invalid Genre Supplied');
        }
    }

    async genresById(id: string): Promise<Genre> {
        const query = this.createQueryBuilder('genre')
        .andWhere('genre.id = :id', { id })
        .leftJoinAndSelect('genre.exchanges', 'exchange')
        .leftJoinAndSelect('genre.markets', 'market')
        .select(['genre', 'market.id', 'market.name', 'exchange.id', 'exchange.name']);
        try {
            const found = await query.getOne();
            if (found) {
                return found;
            } else {
                throw new NotFoundException(`Genre with ID ${id} not found`);
            }
        } catch (error) {
           // this.logger.error(`Invalid Genre Supplied`, error.stack);
            throw new NotAcceptableException('Invalid Genre Supplied');
        }
    }

    async createGenre(createGenreDto: CreateGenreDto): Promise<Genre> {
        const genre = new Genre();
        genre.name = createGenreDto.name.replace(/,/g, ' ');
        genre.markets = createGenreDto.markets;
        genre.exchanges = createGenreDto.exchanges;
        genre.status = ListingStatus.TO_REVIEW;
        try {
            await genre.save();
            return genre;
        } catch (error) {
            if (error.code === '23505') { // duplicate cat name
                this.logger.error(`Failed to create a Genre`, error.stack);
                throw new ConflictException('Name for Genre already exists');
            } else {
                this.logger.error(`Failed to create a genre`, error.stack);
                throw new InternalServerErrorException();
            }
        }
    }
}
