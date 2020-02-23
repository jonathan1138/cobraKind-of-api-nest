import { Repository, EntityRepository } from 'typeorm';
import { SubItem } from './sub-item.entity';
import { Logger, InternalServerErrorException, NotFoundException, ConflictException, NotAcceptableException } from '@nestjs/common';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { CreateSubItemDto } from './dto/create-sub-item-dto';
import { Exchange } from 'src/market-exchange/exchange.entity';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { PriceRatingInfo } from 'src/exchange-price-rating-info/price-rating-info.entity';
import { CreatedYear } from 'src/created-year/year.entity';
import { Manufacturer } from 'src/manufacturer/manufacturer.entity';

@EntityRepository(SubItem)
export class SubItemRepository extends Repository<SubItem> {
    private logger = new Logger('SubItemRepository');
    async getSubItems(filterDto: StatusAndSearchFilterDto,  page: number = 1): Promise<SubItem[]> {
        const query = this.buildQuery(filterDto, page);
        try {
            const subItems = await query.getMany();
            return subItems;
        } catch (error) {
            this.logger.error(`Failed to get subItems for user`, error.stack);
            throw new InternalServerErrorException('Failed to get subItems for user');
        }
    }

    async getSubItemById(id: string): Promise<SubItem> {
        const found = await this.findOne(id);
        if (!found) {
            throw new NotFoundException('SubItem Not found');
        }
        this.incrementView(id);
        return found;
    }

    async subItemByName(name: string): Promise<SubItem> {
        const query = this.createQueryBuilder('subItem');
        query.andWhere('subItem.name = :name', { name });
        try {
            const found = await query.getOne();
            return found;
        } catch (error) {
           // this.logger.error(`Invalid Tag Supplied`, error.stack);
            throw new NotAcceptableException('Invalid Name Supplied');
        }
    }

    async getSubItemByIdForViews(id: string): Promise<SubItem> {
        const found = await this.findOne(id, {relations: ['userIpViews']});
        if (!found) {
            throw new NotFoundException('SubItem Not found');
        }
        return found;
    }

    async getExchangesForSubItem(id: string): Promise<SubItem> {
        const found = await this.findOne(id, {relations: ['exchanges']});
        if (!found) {
            throw new NotFoundException('SubItem Not found');
        }
        this.incrementView(id);
        return found;
    }

    private buildQuery(filterDto: StatusAndSearchFilterDto, page?: number) {
        const { status, search } = filterDto;
        const query = this.createQueryBuilder('subItem')
        .leftJoinAndSelect('subItem.createdYear', 'createdYear')
        .leftJoinAndSelect('subItem.manufacturer', 'manufacturer')
        .leftJoinAndSelect('subItem.exchange', 'exchange')
        .leftJoinAndSelect('subItem.priceRatingInfo', 'priceRatingInfo')
        .select(['subItem', 'exchange.id', 'exchange.name', 'createdYear',
            'manufacturer', 'priceRatingInfo']);
        if (status) {
            query.andWhere('subItem.status = :status', { status });
        }
        if (search) {
            query.andWhere('(LOWER(subItem.name) LIKE :search OR LOWER(subItem.info) LIKE :search)', { search: `%${search.toLowerCase()}%` });
        }
        if (page > 0) {
            query.take(15);
            query.skip(15 * (page - 1));
        }
        return query.orderBy('subItem.name', 'ASC');
    }

    async createSubItem(
        createSubItemDto: CreateSubItemDto, exchange: Exchange, newYear: CreatedYear, newManufacturer: Manufacturer): Promise<SubItem> {
        const { name, info, images } = createSubItemDto;
        const subItem = new SubItem();
        const priceRating = new PriceRatingInfo();

        subItem.name = name.replace(/,/g, ' ');
        subItem.info = info;
        subItem.images = images;
        subItem.exchange = exchange;
        subItem.status = ListingStatus.TO_REVIEW;
        subItem.priceRatingInfo = priceRating;
        subItem.createdYear = newYear;
        subItem.manufacturer = newManufacturer;
        try {
            await subItem.save();
            return subItem;
        } catch (error) {
            if (error.code === '23505') { // duplicate cat name
                this.logger.error(`Failed to create a subItem`, error.stack);
                throw new ConflictException('Name (SubItem) already exists');
            } else {
                this.logger.error(`Failed to create a subItem`, error.stack);
                throw new InternalServerErrorException();
            }
        }
    }

    async updateSubItem(id: string, createSubItemDto: CreateSubItemDto, newYear: CreatedYear, newManufacturer: Manufacturer ): Promise<void> {
        const subItem = await this.getSubItemById(id);
        const { name, info } = createSubItemDto;
        subItem.name = name;
        subItem.info = info;
        subItem.createdYear = newYear;
        subItem.manufacturer = newManufacturer;
        try {
            await subItem.save();
         } catch (error) {
            this.logger.log(error);
            throw new InternalServerErrorException('Failed to update SubItem. Check with administrator');
        }
    }

    async getSubItemsByExchange(filterDto: StatusAndSearchFilterDto, exchangeId: string): Promise<SubItem[]> {
        const { status, search } = filterDto;
        const query = this.createQueryBuilder('subItem')
        .leftJoinAndSelect('subItem.exchange', 'exchange')
        .andWhere('subItem.exchangeId = :exchangeId', { exchangeId });

        if (status) {
            query.andWhere('subItem.status = :status', { status });
        }

        if (search) {
            query.andWhere('(subItem.name LIKE :search OR subItem.info LIKE :search)', { search: `%${search}%` });
        }

        const subItems = await query.getMany();
        if (subItems.length < 1) {
            throw new NotFoundException('Exchange Not found');
        }
        return subItems;
    }

    async incrementView(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(SubItem)
        .set({ views: () => 'views + 1' })
        .execute();
    }

    async incrementLike(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(SubItem)
        .where({id})
        .set({ likes: () => 'likes + 1' })
        .execute();
    }
}
