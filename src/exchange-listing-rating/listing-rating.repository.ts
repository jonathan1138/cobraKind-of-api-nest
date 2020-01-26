import { EntityRepository, Repository } from 'typeorm';
import { Logger, InternalServerErrorException, NotFoundException  } from '@nestjs/common';
import { ListingRating } from './listing-rating.entity';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { CreateListingRatingDto } from './dto/create-listing-rating-dto';
import { Exchange } from 'src/market-exchange/exchange.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { PostType } from '../shared/enums/post-type.enum';

@EntityRepository(ListingRating)
export class ListingRatingRepository extends Repository<ListingRating> {
    private logger = new Logger('ListingRatingRepository');

    async getListingRatings(filterDto: StatusAndSearchFilterDto): Promise<ListingRating[]> {
        const query = this.buildQuery(filterDto);
        try {
            const listingRatings = await query.getMany();
            return listingRatings;
        } catch (error) {
            this.logger.error(`Failed to get listingRatings for user`, error.stack);
            throw new InternalServerErrorException('Failed to get listingRatings for user');
        }
    }

    async getListingRatingsByExchange(filterDto: StatusAndSearchFilterDto, exchangeId: string): Promise<ListingRating[]> {
        const { status, search } = filterDto;
        const query = this.createQueryBuilder('listingRating');
        query.andWhere('listingRating.exchange.id = :exchangeId', { exchangeId });

        if (status) {
            query.andWhere('listingRating.status = :status', { status });
        }

        if (search) {
            query.andWhere('(listingRating.name LIKE :search OR listingRating.info LIKE :search)', { search: `%${search}%` });
        }

        const listingRatings = await query.getMany();
        if (listingRatings.length < 1) {
            throw new NotFoundException('Exchange Not found');
        }
        return listingRatings;
    }

    async getListingRatingById(id: string): Promise<ListingRating> {
        const found = await this.findOne(id);
        if (!found) {
            throw new NotFoundException('ListingRating Not found');
        }
        return found;
    }

    async getListingRatingByIdWithLikes(id: string): Promise<ListingRating> {
        const found = await this.findOne(id, {relations: ['commentLikes']});
        if (!found) {
            throw new NotFoundException('ListingRating Not found');
        }
        return found;
    }

    private buildQuery(filterDto: StatusAndSearchFilterDto) {
        const { status, search } = filterDto;
        const query = this.createQueryBuilder('listingRating');
        query.leftJoinAndSelect('listingRating.exchange', 'exchange');
        if (status) {
            query.andWhere('listingRating.status = :status', { status });
        }
        if (search) {
            query.andWhere('(LOWER(listingRating.name) LIKE :search OR LOWER(listingRating.info) LIKE :search)',
            { search: `%${search.toLowerCase()}%` });
        }
        return query;
    }

    async createListingRating(createListingRatingDto: CreateListingRatingDto, exchange: Exchange, user: UserEntity): Promise<ListingRating> {
        const listingRating = new ListingRating();
        const { rating, comment } = createListingRatingDto;
        listingRating.comment = comment;
        listingRating.rating = rating;
        if ( listingRating.rating <= 3) {
            listingRating.listingRatingType = PostType.COBRA;
            } else {
            listingRating.listingRatingType = PostType.KIND;
        }

        listingRating.exchange = exchange;
        listingRating.user = user;

        try {
            await listingRating.save();
            delete listingRating.exchange;
            delete listingRating.user;
            return listingRating;
        } catch (error) {
            this.logger.error(`Failed to create a listingRating`, error.stack);
            throw new InternalServerErrorException();
        }
    }

    async incrementLike(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(ListingRating)
        .where({id})
        .set({ likes: () => 'likes + 1' })
        .execute();
    }

    async decrementLike(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(ListingRating)
        .where({id})
        .set({ likes: () => 'likes - 1' })
        .execute();
    }
}
