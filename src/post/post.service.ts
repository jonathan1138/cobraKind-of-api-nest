import { Injectable, NotFoundException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { S3UploadService } from 'src/shared/services/s3Uploader/awsS3Upload.service';
import { PostRepository } from './post.repository';
import { ImgFolder } from 'src/shared/enums/upload-img-folder.enum';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { CreatePostDto } from './dto/create-post-dto';
import { PostEntity } from './post.entity';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { UserRepository } from 'src/user/user.repository';
import { UserEntity } from 'src/user/entities/user.entity';
import { ExchangeRepository } from 'src/market-exchange/exchange.repository';
import { UserIp } from 'src/user-ip-for-views/user-ip.entity';
import { Repository } from 'typeorm';
import { PriceRatingInfoRepository } from 'src/exchange-price-rating-info/price-rating-info.repository';
import { MarketRepository } from 'src/market/market.repository';
import { DeletePostDto } from './dto/delete-post-dto';
import { ListingStatusNote } from 'src/shared/enums/listing-status-note.enum';

@Injectable()
export class PostService {
    constructor(
        @InjectRepository(PostRepository)
        private postRepository: PostRepository,
        @InjectRepository(ExchangeRepository)
        private exchangeRepository: ExchangeRepository,
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        @InjectRepository(PriceRatingInfoRepository)
        private priceRatingRepository: PriceRatingInfoRepository,
        @InjectRepository(MarketRepository)
        private marketRepository: MarketRepository,
        @InjectRepository(UserIp)
        private readonly userIpRepository: Repository<UserIp>,
        private readonly s3UploadService: S3UploadService,
    ) {}

    getPosts(filterDto: StatusAndSearchFilterDto, page: number = 1): Promise<PostEntity[]> {
        return this.postRepository.getPosts(filterDto, page);
    }

    async getPostById(id: string): Promise<PostEntity> {
        return await this.postRepository.getPostById(id);
    }

    async getPostByIdIncrementView(id: string, ipAddress: string): Promise<PostEntity> {
        const post =  await this.postRepository.getPostByIdForViews(id);
        if (post) {
            const userIp = new UserIp();
            userIp.ipAddress = ipAddress;
            const foundIp = await this.userIpRepository.findOne({ipAddress});
            if (foundIp) {
                userIp.id = foundIp.id;
            }
            if ( !post.userIpViews.find(x => x.ipAddress === ipAddress) ) {
                post.userIpViews.push(userIp);
                post.views++;
                await post.save();
            }
        }
        delete post.userIpViews;
        return post;
    }

    async getPostsByExchange(filterDto: StatusAndSearchFilterDto, postId: string): Promise<PostEntity[]> {
       return await this.postRepository.getPostsByExchange(filterDto, postId);
    }

    async createPost(createPostDto: CreatePostDto, exchangeId: string, user: UserEntity,
                     images?: object[], filenameInPath?: boolean): Promise<PostEntity> {
        const exchange = await this.exchangeRepository.getExchangeById(exchangeId);
        const market = await this.marketRepository.getMarketById(exchange.marketId);
        if ( Array.isArray(images) && images.length > 0) {
            const s3ImageArray = await this.s3UploadService.uploadImageBatch(images, ImgFolder.POST_IMG_FOLDER, filenameInPath);
            createPostDto.images = s3ImageArray;
        }
        const post = this.postRepository.createPost(createPostDto, exchange, market, user);
        // if (createPostDto.postType === PostType.COBRA) {
        //     exchange.priceRatingInfo.id
        // } else {

        // }
        return post;
    }

    async deletePost(deletePostDto: DeletePostDto): Promise<void> {
        const result = await this.postRepository.delete(deletePostDto.posts);
        if (result.affected === 0) {
            throw new NotFoundException(`Post with ID not found`);
        }
    }

    async updatePostStatus(id: string, status: ListingStatus, statusNote: string ): Promise<PostEntity> {
        const post = await this.postRepository.getPostById(id);
        post.status = status;
        if (!statusNote) {
            switch (post.status) {
                case ListingStatus.REJECTED:
                    post.statusNote = ListingStatusNote.REJECTED;
                    break;
                default:
                    post.statusNote = null;
                }
            } else {
                post.statusNote = statusNote;
        }
        await post.save();
        return post;
    }

    async updatePost(id: string, createPostDto: CreatePostDto): Promise<void> {
        if ( createPostDto.title || createPostDto.description || createPostDto.price || createPostDto.type || createPostDto.condition ) {
            return this.postRepository.updatePost(id, createPostDto);
        }
    }

    async uploadPostImages(id: string, image: any, filenameInPath?: boolean): Promise<string[]> {
        if (image) {
            const post = await this.postRepository.getPostById(id);
            const s3ImgUrlArray = await this.s3UploadService.uploadImageBatch(image, ImgFolder.SUBITEM_IMG_FOLDER, filenameInPath);
            s3ImgUrlArray.forEach(item => {
                post.images.push(item);
            });
            await post.save();
            return post.images;
        } else {
            throw new NotAcceptableException(`File not found`);
        }
    }

    async deletePostImages(id: string): Promise<string[]> {
        const post = await this.postRepository.getPostById(id);
        let arrayImages: string[] = [];
        arrayImages = post.images;
        post.images = [];
        await post.save();
        return arrayImages;
    }

    async watchPost(id: string, userId: string): Promise<PostEntity> {
      const post = await this.postRepository.findOne({id});
      const user = await this.userRepository.findOne(userId, {relations: ['profile', 'profile.watchedPosts']});
      const isntWatched = user.profile.watchedPosts.findIndex(item => item.id === id) < 0;
      if (isntWatched) {
        user.profile.watchedPosts.push(post);
        post.watchCount++;
        await this.userRepository.save(user);
        return await this.postRepository.save(post);
   }
  }

  async unWatchPost(id: string, userId: string): Promise<PostEntity> {
      const post = await this.postRepository.findOne({id});
      const user = await this.userRepository.findOne(userId, {relations: ['profile', 'profile.watchedPosts']});
      const deleteIndex = user.profile.watchedPosts.findIndex(item => item.id === id);
      if (deleteIndex >= 0) {
          user.profile.watchedPosts.splice(deleteIndex, 1);
          post.watchCount--;
          await this.userRepository.save(user);
          return await this.postRepository.save(post);
        }
    }
}
