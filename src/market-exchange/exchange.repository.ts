import { EntityRepository, Repository } from 'typeorm';
import { Logger, NotFoundException, InternalServerErrorException, ConflictException, NotAcceptableException  } from '@nestjs/common';
import { Exchange } from './exchange.entity';
import { StatusAndSearchFilterDto } from '../shared/filters/status-search.filter.dto';
import { CreateExchangeDto } from './dto/create-exchange-dto';
import { Market } from 'src/market/market.entity';
import { Genre } from 'src/exchange-genre/genre.entity';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { SubVariation } from 'src/exchange-subs/exchange-sub-variation/sub-variation.entity';
import { PriceRatingInfo } from 'src/exchange-price-rating-info/price-rating-info.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { CreatedYear } from 'src/created-year/year.entity';

@EntityRepository(Exchange)
export class ExchangeRepository extends Repository<Exchange> {
    private logger = new Logger('ExchangeRepository');

    async getExchanges(filterDto: StatusAndSearchFilterDto, page: number = 1): Promise<Exchange[]> {
        const query = this.buildQuery(filterDto, page);
        try {
            return await query.getMany();
        } catch (error) {
            this.logger.error(`Failed to get exchanges for user`, error.stack);
            throw new InternalServerErrorException('Failed to get exchanges for user');
        }
    }

    async getExchangesByMarket(filterDto: StatusAndSearchFilterDto, marketId: string): Promise<Exchange[]> {
        const { status, search } = filterDto;
        const query = this.createQueryBuilder('exchange')
        .leftJoinAndSelect('exchange.genres', 'genre')
        .andWhere('exchange.marketId = :marketId', { marketId });

        if (status) {
            query.andWhere('exchange.status = :status', { status });
        }

        if (search) {
            query.andWhere('(exchange.name LIKE :search OR exchange.info LIKE :search)', { search: `%${search}%` });
        }

        const exchanges = await query.getMany();
        if (exchanges.length < 1) {
            throw new NotFoundException('Market Not found');
        }
        return exchanges;
    }

    async getExchangesWithSubItems(filterDto: StatusAndSearchFilterDto): Promise<Exchange[]> {
        const query = this.buildQuery(filterDto);

        if (filterDto.status) {
            const status = filterDto.status;
            query.leftJoinAndSelect('exchange.subItems', 'subItem', 'subItem.status = :status', {status});
        } else { query.leftJoinAndSelect('exchange.subItems', 'subItem'); }

        try {
            const exchanges = await query.getMany();
            return exchanges;
        } catch (error) {
            this.logger.error(`Failed to get exchanges with Subitems`, error.stack);
            throw new InternalServerErrorException('Failed to get exchanges with Subitems');
        }
    }

    async getSubItemsByExchangeId(filterDto: StatusAndSearchFilterDto, exchangeId: string): Promise<Exchange> {
        const query = this.buildQuery(filterDto)
        .leftJoinAndSelect('exchange.subItems', 'subItem')
        .andWhere('exchange.id = :exchangeId', {exchangeId});
        const exchange = await query.getOne();
        if (!exchange) {
            throw new NotFoundException('Exchange Not found');
        }
        return exchange;
    }

    async getExchangeById(id: string): Promise<Exchange> {
        const found = await this.findOne(id, {relations: ['market']});
        if (!found) {
            throw new NotFoundException('Exchange Not found');
        }
        Object.entries(found.market).forEach(([key]) => {
            if (key !== 'name') {
                delete found.market[key];
            }
        });
        return found;
    }

    async exchangeByName(name: string): Promise<Exchange> {
        const query = this.createQueryBuilder('exchange');
        query.andWhere('exchange.name = :name', { name });
        try {
            const found = await query.getOne();
            return found;
        } catch (error) {
           // this.logger.error(`Invalid Tag Supplied`, error.stack);
            throw new NotAcceptableException('Invalid Name Supplied');
        }
    }

    async getExchangeByIdForViews(id: string): Promise<Exchange> {
        const found = await this.findOne(id, {relations: ['userIpViews']});
        if (!found) {
            throw new NotFoundException('Exchange Not found');
        }
        return found;
    }

    async getGenres(filterDto: StatusAndSearchFilterDto): Promise<Exchange[]> {
        const query = this.buildQuery(filterDto)
        .leftJoinAndSelect('exchange.genres', 'genre');
        try {
            const exchanges = await query.getMany();
            return exchanges;
        } catch (error) {
            this.logger.error(`Failed to get genres`, error.stack);
            throw new InternalServerErrorException('Failed to get genres');
        }
    }

    async getVariations(filterDto: StatusAndSearchFilterDto): Promise<Exchange[]> {
        const query = this.buildQuery(filterDto)
        .leftJoinAndSelect('exchange.variations', 'variation');
        try {
            const exchanges = await query.getMany();
            return exchanges;
        } catch (error) {
            this.logger.error(`Failed to get exchanges for variations`, error.stack);
            throw new InternalServerErrorException('Failed to get variations');
        }
    }

    async getGenresByMktId(id: string, filterDto: StatusAndSearchFilterDto): Promise<Exchange[]> {
        const query = this.buildQuery(filterDto)
        .andWhere('exchange.marketId = :id', {id});
        try {
            const exchanges = await query.getMany();
            return exchanges;
        } catch (error) {
            this.logger.error(`Failed to get exchanges for user`, error.stack);
            throw new InternalServerErrorException('Failed to get exchanges for user');
        }
    }

    async getVarsByMktId(id: string, filterDto: StatusAndSearchFilterDto): Promise<Exchange[]> {
        const query = this.buildQuery(filterDto)
        .andWhere('exchange.marketId = :id', {id});
        try {
            const exchanges = await query.getMany();
            return exchanges;
        } catch (error) {
            this.logger.error(`Failed to get exchanges for Market Id`, error.stack);
            throw new InternalServerErrorException('Failed to get exchanges for market');
        }
    }

    private buildQuery(filterDto: StatusAndSearchFilterDto, page?: number) {
        const { status, search } = filterDto;
        const query = this.createQueryBuilder('exchange')
        .leftJoinAndSelect('exchange.genres', 'genre')
        .leftJoinAndSelect('exchange.createdYear', 'createdYear')
        .leftJoinAndSelect('exchange.manufacturer', 'manufacturer')
        .leftJoinAndSelect('exchange.subVariations', 'subVariation')
        .leftJoinAndSelect('exchange.market', 'market')
        .leftJoinAndSelect('exchange.priceRatingInfo', 'priceRatingInfo')
        .select(['exchange', 'market.id', 'market.name', 'createdYear',
            'manufacturer', 'genre.id', 'genre.name', 'subVariation', 'priceRatingInfo']);
        if (status) {
            query.andWhere('exchange.status = :status', { status });
        }
        if (search) {
            query.andWhere('(LOWER(exchange.name) LIKE :search OR LOWER(exchange.info) LIKE :search)', { search: `%${search.toLowerCase()}%` });
        }
        if (page > 0) {
            query.take(15);
            query.skip(15 * (page - 1));
        }
        return query.orderBy('exchange.name', 'ASC');
    }

    async createExchange(createExchangeDto: CreateExchangeDto, market: Market, newYear: CreatedYear, newManufacturer: Manufacturer,
                         genres: Genre[], subVars: SubVariation[]): Promise<Exchange> {
        const { name, info, images } = createExchangeDto;
        const exchange = new Exchange();
        const priceRating = new PriceRatingInfo();
        exchange.name = name.replace(/,/g, ' ');
        exchange.info = info;
        exchange.images = images;
        exchange.market = market;
        exchange.status = ListingStatus.TO_REVIEW;
        exchange.priceRatingInfo = priceRating;
        exchange.createdYear = newYear;
        exchange.manufacturer = newManufacturer;

        if (genres) {
            exchange.genres = genres;
        }
        if (subVars) {
            exchange.subVariations = subVars;
        }
        try {
            await exchange.save();
            return exchange;
        } catch (error) {
            if (error.code === '23505') { // duplicate cat name
                this.logger.error(`Failed to create a exchange`, error.stack);
                throw new ConflictException('Name (Exchange, Genre, Year, Manufacturer or SubVar) already exists');
            } else {
                this.logger.error(`Failed to create a exchange`, error.stack);
                throw new InternalServerErrorException();
            }
        }
    }

    async updateExchange(id: string, createExchangeDto: CreateExchangeDto, newYear: CreatedYear, newManufacturer: Manufacturer ): Promise<void> {
        const exchange = await this.getExchangeById(id);
        const { name, info } = createExchangeDto;
        exchange.name = name;
        exchange.info = info;
        exchange.createdYear = newYear;
        exchange.manufacturer = newManufacturer;
        try {
            await exchange.save();
         } catch (error) {
            this.logger.log(error);
            throw new InternalServerErrorException('Failed to update Exchange. Check with administrator');
        }
    }

    async isNameUnique(name: string): Promise<boolean> {
        const query = this.createQueryBuilder('exchange').where('exchange.name = :name', { name });
        try {
            const found = await query.getOne();
            if ( !found ) {
                return true;
            } else {
                return false;
            }
        } catch {
            this.logger.error(`Failed to get exchange requested`);
            return false;
        }
    }

    async incrementView(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(Exchange)
        .where({id})
        .set({ views: () => 'views + 1' })
        .execute();
    }

    async incrementLike(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(Exchange)
        .where({id})
        .set({ likes: () => 'likes + 1' })
        .execute();
    }

    async decrementLike(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(Exchange)
        .where({id})
        .set({ likes: () => 'likes - 1' })
        .execute();
    }
}
