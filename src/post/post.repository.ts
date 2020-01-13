import { Repository, EntityRepository, EntityManager } from 'typeorm';
import { PostEntity } from './post.entity';
import { Logger, InternalServerErrorException, NotFoundException, ConflictException } from '@nestjs/common';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { CreatePostDto } from './dto/create-post-dto';
import { ListingStatus } from '../shared/enums/listing-status.enum';
import { Exchange } from 'src/exchange/exchange.entity';
import { UserEntity } from '../user/entities/user.entity';
import { Market } from 'src/market/market.entity';

@EntityRepository(PostEntity)
export class PostRepository extends Repository<PostEntity> {
    private logger = new Logger('PostRepository');

    async getPosts(filterDto: StatusAndSearchFilterDto): Promise<PostEntity[]> {
        const query = this.buildQuery(filterDto);
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
            query.andWhere('(post.name LIKE :search OR post.info LIKE :search)', { search: `%${search}%` });
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

    async getPostByIdWithIp(id: string): Promise<PostEntity> {
        const found = await this.findOne(id, {relations: ['userIpViews']});
        if (!found) {
            throw new NotFoundException('Post Not found');
        }
        return found;
    }

    private buildQuery(filterDto: StatusAndSearchFilterDto) {
        const { status, search } = filterDto;
        const query = this.createQueryBuilder('post')
        .leftJoinAndSelect('post.exchange', 'exchange')
        .leftJoinAndSelect('post.owner', 'owner');
        if (status) {
            query.andWhere('post.status = :status', { status });
        }
        if (search) {
            query.andWhere('(post.name LIKE :search OR post.info LIKE :search)', { search: `%${search}%` });
        }
        return query;
    }

    async createPost(createPostDto: CreatePostDto, exchange: Exchange, market: Market, user: UserEntity): Promise<PostEntity> {
        const { title, description, images, price, postType } = createPostDto;
        const post = new PostEntity();
        post.title = title;
        post.description = description;
        post.images = images;
        post.price = price;
        post.postType = postType;
        post.status = ListingStatus.TO_REVIEW;
        post.exchange = exchange;
        post.market = market;
        post.subItem = null;
        post.owner = user;
        try {
            await post.save();
            delete post.exchange;
            delete post.market;
            delete post.owner;
            return post;
        } catch (error) {
            this.logger.error(`Failed to create a post`, error.stack);
            throw new InternalServerErrorException();
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
