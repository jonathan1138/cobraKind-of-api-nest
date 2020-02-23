import { Repository, EntityRepository, EntityManager } from 'typeorm';
import { PostEntity } from './post.entity';
import { Logger, InternalServerErrorException, NotFoundException, ConflictException } from '@nestjs/common';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { CreatePostDto } from './dto/create-post-dto';
import { ListingStatus } from '../shared/enums/listing-status.enum';
import { Exchange } from 'src/market-exchange/exchange.entity';
import { UserEntity } from '../user/entities/user.entity';
import { Market } from 'src/market/market.entity';
import { Part } from 'src/market-part/part.entity';
import { SubItem } from 'src/exchange-subs/exchange-sub-item/sub-item.entity';
import { PostListingType } from '../shared/enums/post-listing-type.enum';

@EntityRepository(PostEntity)
export class PostRepository extends Repository<PostEntity> {
    private logger = new Logger('PostRepository');

    async getPosts(filterDto: StatusAndSearchFilterDto, page: number = 1): Promise<PostEntity[]> {
        const query = this.buildQuery(filterDto, page);
        try {
            const posts = await query.getMany();
            return posts;
        } catch (error) {
            this.logger.error(`Failed to get posts for user`, error.stack);
            throw new InternalServerErrorException('Failed to get posts for user');
        }
    }

    async getPostsByExchange(filterDto: StatusAndSearchFilterDto, exchangeId: string): Promise<PostEntity[]> {
        const { status, search } = filterDto;
        const query = this.createQueryBuilder('post')
        .andWhere('post.exchange.id = :exchangeId', { exchangeId });
        if (status) {
            query.andWhere('post.status = :status', { status });
        }
        if (search) {
            query.andWhere('(post.name LIKE :search OR post.description LIKE :search)', { search: `%${search}%` });
        }
        const posts = await query.getMany();
        if (posts.length < 1) {
            throw new NotFoundException('Exchange Not found');
        }
        return posts;
    }

    async getSubItemsByPostId(filterDto: StatusAndSearchFilterDto, postId: string): Promise<PostEntity> {
        const query = this.buildQuery(filterDto)
        .leftJoinAndSelect('post.subItems', 'subItem')
        .andWhere('post.id = :postId', {postId});
        const post = await query.getOne();
        if (!post) {
            throw new NotFoundException('Post Not found');
        }
        return post;
    }

    async getPostById(id: string): Promise<PostEntity> {
        const found = await this.findOne(id);
        if (!found) {
            throw new NotFoundException('Post Not found');
        }
        return found;
    }

    async getPostByIdForViews(id: string): Promise<PostEntity> {
        const found = await this.findOne(id, {relations: ['userIpViews']});
        if (!found) {
            throw new NotFoundException('Post Not found');
        }
        return found;
    }

    private buildQuery(filterDto: StatusAndSearchFilterDto, page?: number) {
        const { status, search, listingType } = filterDto;
        const query = this.createQueryBuilder('post')
        .leftJoinAndSelect('post.exchange', 'exchange')
        .leftJoinAndSelect('post.part', 'part')
        .leftJoinAndSelect('post.subItem', 'subItem')
        .leftJoinAndSelect('post.owner', 'owner')
        .select(['post', 'part.id', 'part.name', 'exchange.id', 'exchange.name', 'subItem.id', 'subItem.name', 'owner.id', 'owner.name']);
        if (status) {
            query.andWhere('post.status = :status', { status });
        }
        if (listingType) {
            query.andWhere('post.listingType = :listingType', { listingType });
        }
        if (search) {
            query.andWhere('(LOWER(post.title) LIKE :search OR LOWER(post.description) LIKE :search)', { search: `%${search.toLowerCase()}%` });
        }
        if (page > 0) {
            query.take(15);
            query.skip(15 * (page - 1));
        }
        return query.orderBy('post.title', 'ASC');
    }

    async createExchangePost(createPostDto: CreatePostDto, market: Market, user: UserEntity, exchange: Exchange): Promise<PostEntity> {
        const { title, description, images, price, side, condition } = createPostDto;
        const post = new PostEntity();
        post.title = title;
        post.description = description;
        post.images = images;
        post.price = price;
        post.side = side;
        post.status = ListingStatus.TO_REVIEW;
        post.condition = condition;
        post.exchange = exchange;
        post.market = market;
        post.subItem = null;
        post.part = null;
        post.owner = user;
        post.listingType = PostListingType.EXCHANGE;
        try {
            await post.save();
            return post;
        } catch (error) {
            this.logger.error(`Failed to create an Exchange post`, error.stack);
            throw new InternalServerErrorException();
        }
    }

    async createPartPost(createPostDto: CreatePostDto, market: Market, user: UserEntity, part: Part): Promise<PostEntity> {
        const { title, description, images, price, side, condition } = createPostDto;
        const post = new PostEntity();
        post.title = title;
        post.description = description;
        post.images = images;
        post.price = price;
        post.side = side;
        post.status = ListingStatus.TO_REVIEW;
        post.condition = condition;
        post.part = part;
        post.market = market;
        post.subItem = null;
        post.exchange = null;
        post.owner = user;
        post.listingType = PostListingType.PART;
        try {
            await post.save();
            return post;
        } catch (error) {
            this.logger.error(`Failed to create a Part post`, error.stack);
            throw new InternalServerErrorException();
        }
    }

    async createSubItemPost(createPostDto: CreatePostDto, market: Market, user: UserEntity, subItem: SubItem): Promise<PostEntity> {
        const { title, description, images, price, side, condition } = createPostDto;
        const post = new PostEntity();
        post.title = title;
        post.description = description;
        post.images = images;
        post.price = price;
        post.side = side;
        post.status = ListingStatus.TO_REVIEW;
        post.condition = condition;
        post.subItem = subItem;
        post.market = market;
        post.exchange = null;
        post.part = null;
        post.owner = user;
        post.listingType = PostListingType.SUBITEM;
        try {
            await post.save();
            return post;
        } catch (error) {
            this.logger.error(`Failed to create a Part post`, error.stack);
            throw new InternalServerErrorException();
        }
    }

    async updatePost(id: string, createPostDto: CreatePostDto): Promise<void> {
        const post = await this.getPostById(id);
        const { title, description, price, condition, side } = createPostDto;
        post.title = title;
        post.description = description;
        post.condition = condition;
        post.price = price;
        post.side = side;
        try {
            await post.save();
         } catch (error) {
            this.logger.log(error);
            throw new InternalServerErrorException('Failed to update Post. Check with administrator');
        }
    }

    async incrementView(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(PostEntity)
        .where({id})
        .set({ views: () => 'views + 1' })
        .execute();
    }
}
