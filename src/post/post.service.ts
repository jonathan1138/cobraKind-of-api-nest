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
import { ExchangeRepository } from 'src/exchange/exchange.repository';
import { UserIp } from 'src/user-ip-for-views/userIp.entity';
import { Repository } from 'typeorm';
import { PriceRatingInfoRepository } from 'src/exchange-price-rating-info/price-rating-info.repository';
import { PriceRatingInfo } from 'src/exchange-price-rating-info/price-rating-info.entity';
import { PostType } from 'src/shared/enums/post-type.enum';
import { MarketRepository } from 'src/market/market.repository';
import { DeletePostDto } from './dto/delete-post-dto';

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

    getPosts(filterDto: StatusAndSearchFilterDto): Promise<PostEntity[]> {
        return this.postRepository.getPosts(filterDto);
    }

    async getPostById(id: string): Promise<PostEntity> {
        return await this.postRepository.getPostById(id);
    }

    async getPostByIdIncrementView(id: string, ipAddress: string): Promise<PostEntity> {
        const post =  await this.postRepository.getPostByIdWithIp(id);
        if (post) {
            const userIp = new UserIp();
            userIp.ipAddress = ipAddress;
            const foundIp = await this.userIpRepository.findOne({ipAddress});
            if (foundIp) {
                userIp.id = foundIp.id;
            }
            if ( !post.userIpPosts.find(x => x.ipAddress === ipAddress) ) {
                post.userIpPosts.push(userIp);
                await post.save();
                this.postRepository.incrementView(id);
            }
        }
        delete post.userIpPosts;
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

    async updatePostStatus(id: string, status: ListingStatus ): Promise<PostEntity> {
        const post = await this.postRepository.getPostById(id);
        post.status = status;
        await post.save();
        return post;
    }

    async uploadPostImage(id: string, image: any, filenameInPath?: boolean): Promise<void> {
        if (image) {
            const post = await this.postRepository.getPostById(id);
            if ( image ) {
                const s3ImgUrl = await this.s3UploadService.uploadImage(image, ImgFolder.EXCHANGE_IMG_FOLDER, filenameInPath);
                post.images.push(s3ImgUrl);
                await post.save();
            }
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

    async watchPost(id: string, userId: string): Promise<void> {
      const listing = await this.postRepository.findOne({id});
      const user = await this.userRepository.findOne(userId, {relations: ['profile', 'profile.watchedExchanges']});
      const isntWatched = user.profile.watchedPosts.findIndex(post => post.id === id) < 0;
      if (isntWatched) {
        user.profile.watchedPosts.push(listing);
        listing.watchCount++;
        await this.userRepository.save(user);
        await this.exchangeRepository.save(listing);
   }
  }

  async unWatchPost(id: string, userId: string): Promise<void> {
      const listing = await this.postRepository.findOne({id});
      const user = await this.userRepository.findOne(userId, {relations: ['profile', 'profile.watchedExchanges']});
      const deleteIndex = user.profile.watchedPosts.findIndex(post => post.id === id);
      if (deleteIndex >= 0) {
          user.profile.watchedPosts.splice(deleteIndex, 1);
          listing.watchCount--;
          await this.userRepository.save(user);
          await this.exchangeRepository.save(listing);
        }
    }
}
