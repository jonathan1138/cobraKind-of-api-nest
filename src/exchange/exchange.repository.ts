import { EntityRepository, Repository } from 'typeorm';
import { Logger, NotFoundException, InternalServerErrorException, ConflictException  } from '@nestjs/common';
import { Exchange } from './exchange.entity';
import { StatusAndSearchFilterDto } from '../shared/filters/status-search.filter.dto';
import { CreateExchangeDto } from './dto/create-exchange-dto';
import { Market } from 'src/market/market.entity';
import { Genre } from 'src/exchange-genre/genre.entity';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { SubVariation } from 'src/exchange-sub-variation/sub-variation.entity';
import { PriceRatingInfo } from 'src/exchange-price-rating-info/price-rating-info.entity';

@EntityRepository(Exchange)
export class ExchangeRepository extends Repository<Exchange> {
    private logger = new Logger('ExchangeRepository');

    async getExchanges(filterDto: StatusAndSearchFilterDto): Promise<Exchange[]> {
        const query = this.buildQuery(filterDto);
        try {
            const exchanges = await query.getMany();
            return exchanges;
        } catch (error) {
            this.logger.error(`Failed to get exchanges for user`, error.stack);
            throw new InternalServerErrorException('Failed to get exchanges for user');
        }
    }

    async getExchangesByMarket(filterDto: StatusAndSearchFilterDto, marketId: string): Promise<Exchange[]> {
        const { status, search } = filterDto;
        const query = this.createQueryBuilder('exchange');
        query.leftJoinAndSelect('exchange.genres', 'genre');
        query.andWhere('exchange.marketId = :marketId', { marketId });

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
        const query = this.buildQuery(filterDto);
        query.leftJoinAndSelect('exchange.subItems', 'subItem');
        query.andWhere('exchange.id = :exchangeId', {exchangeId});

        const exchange = await query.getOne();
        if (!exchange) {
            throw new NotFoundException('Exchange Not found');
        }
        return exchange;
    }

    async getExchangeById(id: string): Promise<Exchange> {
        const found = await this.findOne(id);
        if (!found) {
            throw new NotFoundException('Exchange Not found');
        }
        return found;
    }

    async getExchangeByIdWithIp(id: string): Promise<Exchange> {
        const found = await this.findOne(id, {relations: ['userIpExchanges']});
        if (!found) {
            throw new NotFoundException('Exchange Not found');
        }
        return found;
    }

    async getGenres(filterDto: StatusAndSearchFilterDto): Promise<Exchange[]> {
        const query = this.buildQuery(filterDto);
        query.leftJoinAndSelect('exchange.genres', 'genre');
        try {
            const exchanges = await query.getMany();
            return exchanges;
        } catch (error) {
            this.logger.error(`Failed to get genres`, error.stack);
            throw new InternalServerErrorException('Failed to get genres');
        }
    }

    async getVariations(filterDto: StatusAndSearchFilterDto): Promise<Exchange[]> {
        const query = this.buildQuery(filterDto);
        query.leftJoinAndSelect('exchange.variations', 'variation');
        try {
            const exchanges = await query.getMany();
            return exchanges;
        } catch (error) {
            this.logger.error(`Failed to get exchanges for variations`, error.stack);
            throw new InternalServerErrorException('Failed to get variations');
        }
    }

    async getGenresByMktId(id: string, filterDto: StatusAndSearchFilterDto): Promise<Exchange[]> {
        const query = this.buildQuery(filterDto);
        query.andWhere('exchange.marketId = :id', {id});
        try {
            const exchanges = await query.getMany();
            return exchanges;
        } catch (error) {
            this.logger.error(`Failed to get exchanges for user`, error.stack);
            throw new InternalServerErrorException('Failed to get exchanges for user');
        }
    }

    async getVarsByMktId(id: string, filterDto: StatusAndSearchFilterDto): Promise<Exchange[]> {
        const query = this.buildQuery(filterDto);
        query.andWhere('exchange.marketId = :id', {id});
        try {
            const exchanges = await query.getMany();
            return exchanges;
        } catch (error) {
            this.logger.error(`Failed to get exchanges for Market Id`, error.stack);
            throw new InternalServerErrorException('Failed to get exchanges for market');
        }
    }

    private buildQuery(filterDto: StatusAndSearchFilterDto) {
        const { status, search } = filterDto;
        const query = this.createQueryBuilder('exchange');
        query.leftJoinAndSelect('exchange.genres', 'genre');
        query.leftJoinAndSelect('exchange.subVariations', 'subVariation');
        if (status) {
            query.andWhere('exchange.status = :status', { status });
        }
        if (search) {
            query.andWhere('(exchange.name LIKE :search OR exchange.info LIKE :search)', { search: `%${search}%` });
        }
        return query;
    }

    async createExchange(createExchangeDto: CreateExchangeDto, market: Market, genres: Genre[], subVars: SubVariation[]): Promise<Exchange> {
        const { name, info, images, manufacturer, year } = createExchangeDto;
        const exchange = new Exchange();
        const priceRating = new PriceRatingInfo();

        exchange.name = name.replace(/,/g, ' ');
        exchange.info = info;
        exchange.images = images;
        exchange.market = market;
        exchange.status = ListingStatus.TO_REVIEW;
        exchange.year = year;
        exchange.manufacturer = manufacturer;
        exchange.priceRatingInfo = priceRating;

        if (genres) {
            exchange.genres = genres;
        }
        if (subVars) {
            exchange.subVariations = subVars;
        }
        try {
            await exchange.save();
            delete exchange.market;
            delete exchange.priceRatingInfo;
            return exchange;
        } catch (error) {
            if (error.code === '23505') { // duplicate cat name
                this.logger.error(`Failed to create a exchange`, error.stack);
                throw new ConflictException('Name (Exchange, Genre or SubVar) already exists');
            } else {
                this.logger.error(`Failed to create a exchange`, error.stack);
                throw new InternalServerErrorException();
            }
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
}
