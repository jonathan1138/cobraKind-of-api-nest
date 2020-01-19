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

    async getMarkets(filterDto: StatusAndSearchFilterDto, page: number = 1): Promise<Market[]> {
        const query = this.buildQuery(filterDto, page);
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

    async getMarketByIdForViews(id: string): Promise<Market> {
        const found = await this.findOne(id, {relations: ['userIpMarkets']});
        if (!found) {
            throw new NotFoundException('Market Not found');
        }
        return found;
    }

    async getExchangeForMarket(id: string): Promise<Market> {
        const found = await this.findOne(id, {relations: ['exchanges']});
        if (!found) {
            throw new NotFoundException('Market Not found');
        }
        return found;
    }

    async getPartForMarket(id: string): Promise<Market> {
        const found = await this.findOne(id, {relations: ['parts']});
        if (!found) {
            throw new NotFoundException('Market Not found');
        }
        return found;
    }

    async getExchangeAndPartForMarket(id: string): Promise<Market> {
        const found = await this.findOne(id, {relations: ['exchanges', 'parts']});
        if (!found) {
            throw new NotFoundException('Market Not found');
        }
        return found;
    }

    async getTags(filterDto: StatusAndSearchFilterDto, page: number = 1): Promise<Market[]> {
        const query = this.buildQuery(filterDto, page)
        .leftJoinAndSelect('market.tags', 'tag');
        try {
            const markets = await query.getMany();
            return markets;
        } catch (error) {
            this.logger.error(`Failed to get markets for user`, error.stack);
            throw new InternalServerErrorException('Failed to get markets for user');
        }
    }

    async getTagsByCatId(id: string, filterDto: StatusAndSearchFilterDto, page: number = 1): Promise<Market[]> {
        const query = this.buildQuery(filterDto, page)
        .andWhere('market.categoryId = :id', {id});
        try {
            const markets = await query.getMany();
            return markets;
        } catch (error) {
            this.logger.error(`Failed to get markets for category`, error.stack);
            throw new InternalServerErrorException('Failed to get markets for category');
        }
    }

    async getMarketsByCategory(filterDto: StatusAndSearchFilterDto, categoryId: string, page: number = 1): Promise<Market[]> {
        const { status, search } = filterDto;
        const query = this.createQueryBuilder('market')
        .leftJoinAndSelect('market.tags', 'tag')
        .andWhere('market.categoryId = :categoryId', { categoryId });
        if (page > 0) {
            query.take(15);
            query.skip(15 * (page - 1));
        }
        if (status) {
            query.andWhere('market.status = :status', { status });
        }
        if (search) {
            query.andWhere('(market.name LIKE :search OR market.info LIKE :search)', { search: `%${search}%` });
        }
        const markets = await query.orderBy('market.name', 'ASC').getMany();
        if (markets.length < 1) {
            throw new NotFoundException('Category Not found');
        }
        return markets;
    }

    private buildQuery(filterDto: StatusAndSearchFilterDto, page: number) {
        const { status, search } = filterDto;
        const query = this.createQueryBuilder('market')
        .leftJoinAndSelect('market.tags', 'tag');
        if (status) {
            query.andWhere('market.status = :status', { status });
        }
        if (search) {
            query.andWhere('(market.name LIKE :search OR market.info LIKE :search)', { search: `%${search}%` });
        }
        if (page > 0) {
            query.take(15);
            query.skip(15 * (page - 1));
        }
        return query.orderBy('market.name', 'ASC');
    }

    async createMarket(createMarketDto: CreateMarketDto, category: Category, tags: Tag[]): Promise<Market> {
        const { name, info, images } = createMarketDto;
        const market = new Market();
        const marketShape = new MarketShape();

        market.name = name.replace(/,/g, ' ');
        market.info = info;
        market.images = images;
        market.category = category;
        market.status = ListingStatus.TO_REVIEW;
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

    async updateMarket(id: string, createMarketDto: CreateMarketDto ): Promise<void> {
        const market = await this.getMarketById(id);
        const { name, info } = createMarketDto;
        market.name = name;
        market.info = info;
        try {
            await market.save();
         } catch (error) {
            throw new InternalServerErrorException('Failed to update Market. Check with administrator');
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
