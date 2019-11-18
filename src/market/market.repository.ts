import { Market } from './market.entity';
import { EntityRepository, Repository } from 'typeorm';
import { CreateMarketDto } from './dto/create-market-dto';
import { ListingStatus } from '../shared/enums/listing-status.enum';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { Logger, InternalServerErrorException, ConflictException, NotFoundException } from '@nestjs/common';
import { Category } from '../category/category.entity';
import { Tag } from 'src/market-tag/tag.entity';
import { MarketShape } from 'src/market-shape/market-shape.entity';
import { SubExchangeType } from '../shared/enums/sub-exchange-type.enum';

@EntityRepository(Market)
export class MarketRepository extends Repository<Market> {
    private logger = new Logger('MarketRepository');

    async getMarkets(filterDto: StatusAndSearchFilterDto): Promise<Market[]> {
        const query = this.buildQuery(filterDto);
        try {
            const markets = await query.getMany();
            return markets;
        } catch (error) {
            this.logger.error(`Failed to get markets for user`, error.stack);
            throw new InternalServerErrorException('Failed to get markets for user');
        }
    }

    async getMarketById(id: string): Promise<Market> {
        const found = await this.findOne(id);
        if (!found) {
            throw new NotFoundException('Market Not found');
        }
        return found;
    }

    async getMarketByIdWithIps(id: string): Promise<Market> {
        const found = await this.findOne(id, {relations: ['userIpMarkets']});
        if (!found) {
            throw new NotFoundException('Market Not found');
        }
        return found;
    }

    async getExchangesForMarket(id: string): Promise<Market> {
        const found = await this.findOne(id, {relations: ['exchanges']});
        if (!found) {
            throw new NotFoundException('Market Not found');
        }
        return found;
    }

    async getPartsForMarket(id: string): Promise<Market> {
        const found = await this.findOne(id, {relations: ['parts']});
        if (!found) {
            throw new NotFoundException('Market Not found');
        }
        return found;
    }

    async getExchangesAndPartsForMarket(id: string): Promise<Market> {
        const found = await this.findOne(id, {relations: ['exchanges', 'parts']});
        if (!found) {
            throw new NotFoundException('Market Not found');
        }
        return found;
    }

    async getTags(filterDto: StatusAndSearchFilterDto): Promise<Market[]> {
        const query = this.buildQuery(filterDto);
        query.leftJoinAndSelect('market.tags', 'tag');
        try {
            const markets = await query.getMany();
            return markets;
        } catch (error) {
            this.logger.error(`Failed to get markets for user`, error.stack);
            throw new InternalServerErrorException('Failed to get markets for user');
        }
    }

    async getTagsByCatId(id: string, filterDto: StatusAndSearchFilterDto): Promise<Market[]> {
        const query = this.buildQuery(filterDto);
        query.andWhere('market.categoryId = :id', {id});
        try {
            const markets = await query.getMany();
            return markets;
        } catch (error) {
            this.logger.error(`Failed to get markets for category`, error.stack);
            throw new InternalServerErrorException('Failed to get markets for category');
        }
    }

    private buildQuery(filterDto: StatusAndSearchFilterDto) {
        const { status, search } = filterDto;
        const query = this.createQueryBuilder('market');
        query.leftJoinAndSelect('market.tags', 'tag');
        if (status) {
            query.andWhere('market.status = :status', { status });
        }
        if (search) {
            query.andWhere('(market.name LIKE :search OR market.info LIKE :search)', { search: `%${search}%` });
        }
        return query;
    }

    async createMarket(createMarketDto: CreateMarketDto, category: Category, tags: Tag[]): Promise<Market> {
        const { name, info, images } = createMarketDto;
        const market = new Market();
        const marketShape = new MarketShape();

        market.name = name.replace(/,/g, ' ');
        market.info = info;
        market.images = images;
        market.category = category;
        market.status = ListingStatus.RECEIVED;
        market.tags = tags;
        market.marketShape = marketShape;
        market.marketShape.namingConvention = market.name;
        market.marketShape.subExchangeType = SubExchangeType.NONE;

        try {
            await market.save();
            delete market.category;
            return market;
        } catch (error) {
            if (error.code === '23505') { // duplicate cat name
                this.logger.error(`Failed to create a market`, error.stack);
                throw new ConflictException('Name (Market or Tag) already exists');
            } else {
                this.logger.error(`Failed to create a market`, error.stack);
                throw new InternalServerErrorException();
            }
        }
    }

    async isNameUnique(name: string): Promise<boolean> {
        const query = this.createQueryBuilder('market').where('market.name = :name', { name });
        try {
            const found = await query.getOne();
            if ( !found ) {
                return true;
            } else {
                return false;
            }
        } catch {
            this.logger.error(`Failed to get market requested`);
            return false;
        }
    }

    async getMarketsByCategory(filterDto: StatusAndSearchFilterDto, categoryId: string): Promise<Market[]> {
        const { status, search } = filterDto;
        const query = this.createQueryBuilder('market');
        query.leftJoinAndSelect('market.tags', 'tag');
        query.andWhere('market.categoryId = :categoryId', { categoryId });

        if (status) {
            query.andWhere('market.status = :status', { status });
        }

        if (search) {
            query.andWhere('(market.name LIKE :search OR market.info LIKE :search)', { search: `%${search}%` });
        }

        const markets = await query.getMany();
        if (markets.length < 1) {
            throw new NotFoundException('Category Not found');
        }
        return markets;
    }

    async incrementView(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(Market)
        .where({id})
        .set({ views: () => 'views + 1' })
        .execute();
    }

    // async incrementLike(id: string): Promise<void> {
    //     await this.createQueryBuilder()
    //     .update(Market)
    //     .set({ likes: () => 'likes + 1' })
    //     .execute();
    // }
}
