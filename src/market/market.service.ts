import { Injectable, NotFoundException, NotAcceptableException, ConflictException, Logger, Inject, forwardRef } from '@nestjs/common';
import { CreateMarketDto } from './dto/create-market-dto';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MarketRepository } from './market.repository';
import { Market } from './market.entity';
import { ListingStatus } from '../shared/enums/listing-status.enum';
import { ImgFolder } from '../shared/enums/upload-img-folder.enum';
import { S3UploadService } from 'src/shared/services/s3Uploader/awsS3Upload.service';
import { CategoryRepository } from 'src/category/category.repository';
import { TagRepository } from '../market-tag/tag.repository';
import { Tag } from 'src/market-tag/tag.entity';
import { Uuid } from 'aws-sdk/clients/groundstation';
import { UserRepository } from 'src/user/user.repository';
import { UserIp } from 'src/user-ip-for-views/user-ip.entity';
import { Repository } from 'typeorm';
import { ListingStatusNote } from 'src/shared/enums/listing-status-note.enum';
import { ProfileService } from 'src/user-profile/profile.service';

@Injectable()
export class MarketService {
    constructor(
        @InjectRepository(MarketRepository)
        private marketRepository: MarketRepository,
        @InjectRepository(CategoryRepository)
        private categoryRepository: CategoryRepository,
        @InjectRepository(TagRepository)
        private tagRepository: TagRepository,
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        @InjectRepository(UserIp)
        private readonly userIpRepository: Repository<UserIp>,
        private readonly s3UploadService: S3UploadService,
        private readonly profileService: ProfileService,
    ) {}

    getMarkets(filterDto: StatusAndSearchFilterDto, page: number = 1): Promise<Market[]> {
        return this.marketRepository.getMarkets(filterDto, page);
    }

    async getMarketById(id: string): Promise<Market> {
        return await this.marketRepository.getMarketById(id);
    }

    async marketIdByName(name: string): Promise<string> {
        return await this.marketRepository.marketIdByName(name);
    }

    async getMarketByIdIncrementView(id: string, ipAddress: string): Promise<Market> {
        const market =  await this.marketRepository.getMarketByIdForViews(id);
        if (market) {
            const userIp = new UserIp();
            userIp.ipAddress = ipAddress;
            const foundIp = await this.userIpRepository.findOne({ipAddress});
            if (foundIp) {
                userIp.id = foundIp.id;
            }
            if ( !market.userIpMarkets.find(x => x.ipAddress === ipAddress) ) {
                market.userIpMarkets.push(userIp);
                market.views++;
                await market.save();
                // this.marketRepository.incrementView(id);
            }
        }
        delete market.userIpMarkets;
        return market;
    }

    async getMarketsByCategory(filterDto: StatusAndSearchFilterDto, categoryId: string, page: number = 1): Promise<Market[]> {
       return await this.marketRepository.getMarketsByCategory(filterDto, categoryId, page);
    }

    async getExchangeForMarket(id: string): Promise<Market> {
        return await this.marketRepository.getExchangeForMarket(id);
    }

    async getPartForMarket(id: string, page: number = 1): Promise<Market> {
        return await this.marketRepository.getPartForMarket(id);
    }

    async getExchangeAndPartForMarket(id: string, page: number = 1): Promise<Market> {
        return await this.marketRepository.getExchangeAndPartForMarket(id);
    }

    getTags(filterDto: StatusAndSearchFilterDto, page: number = 1): Promise<Market[]> {
        return this.marketRepository.getTags(filterDto, page);
    }

    getTagsByCatId(id: string, filterDto: StatusAndSearchFilterDto, page: number = 1): Promise<Market[]> {
        return this.marketRepository.getTagsByCatId(id, filterDto, page);
    }

    async createMarket(createMarketDto: CreateMarketDto, categoryId: string, userId: string,
                       images?: object[], filenameInPath?: boolean): Promise<Market> {
        const category = await this.categoryRepository.getCategoryById(categoryId);
        const isMarketNameUnique = await this.marketRepository.isNameUnique(createMarketDto.name);
        const { tags } = createMarketDto;
        const processType = 'CREATE';
        const processedTags = await this.processTags(category.id, tags, processType);

        if ( isMarketNameUnique ) {
            if ( Array.isArray(images) && images.length > 0) {
                const s3ImageArray = await this.s3UploadService.uploadImageBatch(images, ImgFolder.MARKET_IMG_FOLDER, filenameInPath);
                createMarketDto.images = s3ImageArray;
            }
            const created = await this.marketRepository.createMarket(createMarketDto, category, processedTags);
            this.profileService.updateCreatedMarkets(userId, created);
            return created;
        } else {
            throw new ConflictException('Market already exists');
        }
    }

    async updateMarket(id: string, createMarketDto: CreateMarketDto): Promise<void> {
        if ( createMarketDto.name || createMarketDto.info ) {
          return this.marketRepository.updateMarket(id, createMarketDto);
        } else {
          throw new NotAcceptableException(`Update details not provided`);
        }
    }

    async deleteMarket(id: string): Promise<void> {
        const result = await this.marketRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Market with ID ${id} not found`);
        }
    }

    async updateMarketStatus(id: string, status: ListingStatus, statusNote: string ): Promise<Market> {
        const market = await this.marketRepository.getMarketById(id);
        market.status = status;
        if (!statusNote) {
            switch (market.status) {
                // case ListingStatus.TO_REVIEW:
                //   market.statusNote = ListingStatusNote.TO_REVIEW;
                //   break;
                // case ListingStatus.APPROVED:
                //   market.statusNote = ListingStatusNote.APPROVED;
                //   break;
                case ListingStatus.REJECTED:
                  market.statusNote = ListingStatusNote.REJECTED;
                  break;
                default:
                   market.statusNote = null;
                }
            } else {
            market.statusNote = statusNote;
        }
        await market.save();
        return market;
    }

    async updateMarketTags(id: string, tags: string[] ): Promise<Market> {
        const market = await this.marketRepository.getMarketById(id);
        const processType = 'UPDATE';
        if (tags) {
            const processedTags = await this.processTags(market.categoryId, tags, processType);
            processedTags.length ? market.tags = processedTags : market.tags = [];
        } else {
            market.tags = [];
        }
        await market.save();
        return market;
    }

    async uploadMarketImages(id: string, image: any, filenameInPath?: boolean): Promise<string[]> {
        if (image) {
            const market = await this.marketRepository.getMarketById(id);
            const s3ImgUrlArray = await this.s3UploadService.uploadImageBatch(image, ImgFolder.MARKET_IMG_FOLDER, filenameInPath);
            s3ImgUrlArray.forEach(item => {
                market.images.push(item);
            });
            await market.save();
            return market.images;
        } else {
            throw new NotAcceptableException(`File not found`);
        }
    }

    async deleteMarketImages(id: string): Promise<string[]> {
        const market = await this.marketRepository.getMarketById(id);
        let arrayImages: string[] = [];
        arrayImages = market.images;
        market.images = [];
        await market.save();
        return arrayImages;
    }

    async processTags(catId: Uuid, tags: string[], processType: string): Promise<Tag[]> {
        const newTags: Tag[] = [];
        let assureArray = [];
        if ( !Array.isArray(tags) ) {
            assureArray.push(tags);
        } else {
            assureArray = [...tags];
        }
        const uploadPromises = assureArray.map(async (tag, index: number) => {
            const newTag = new Tag();
            const foundTag = await this.tagRepository.tagsByName(tag);
            if (foundTag) {
            //    if ( (foundTag.categoryId === catId) && (processType.localeCompare('CREATE')) ) {
                    newTag.id = foundTag.id;
            //    } else {
            //        throw new ConflictException('This tag exists in another category / tags must be unique per category');
            //    }
            }
            newTag.name = tag;
            newTag.categoryId = catId;
            newTag.status = ListingStatus.TO_REVIEW;
            newTags.push(newTag);
        });
        await Promise.all(uploadPromises);
        return newTags;
    }
    // getAllMarkets(): Market[] {
    //     const copiedMarkets = JSON.parse(JSON.stringify(this.Markets));
    //     return copiedMarkets;
    // }

    async watchMarket(id: string, userId: string): Promise<Market> {
        const mkt = await this.marketRepository.findOne({id});
        const user = await this.userRepository.findOne(userId, {relations: ['profile', 'profile.watchedMarkets']});
        const isntWatched = user.profile.watchedMarkets.findIndex(market => market.id === id) < 0;
        if (isntWatched) {
          user.profile.watchedMarkets.push(mkt);
          mkt.watchCount++;
          await this.userRepository.save(user);
          return this.marketRepository.save(mkt);
     }
    }

    async unWatchMarket(id: string, userId: string): Promise<Market> {
        const mkt = await this.marketRepository.findOne({id});
        const user = await this.userRepository.findOne(userId, {relations: ['profile', 'profile.watchedMarkets']});
        const deleteIndex = user.profile.watchedMarkets.findIndex(market => market.id === id);
        if (deleteIndex >= 0) {
            user.profile.watchedMarkets.splice(deleteIndex, 1);
            mkt.watchCount--;
            await this.userRepository.save(user);
            return this.marketRepository.save(mkt);
        }
    }
}
