import { Injectable, NotFoundException, NotAcceptableException, ConflictException, Logger } from '@nestjs/common';
import { CreateMarketDto } from './dto/create-market-dto';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MarketRepository } from './market.repository';
import { Market } from './market.entity';
import { ListingStatus } from '../shared/enums/listing-status.enum';
import { ImgFolder } from '../shared/enums/upload-img-folder.enum';
import { S3UploadService } from 'src/shared/services/awsS3Upload.service';
import { CategoryRepository } from 'src/category/category.repository';
import { TagRepository } from '../market-tag/tag.repository';
import { Tag } from 'src/market-tag/tag.entity';
import { Uuid } from 'aws-sdk/clients/groundstation';
import { FileReaderService } from 'src/shared/services/csvFileReaders/fileReader.service';
import { UserRepository } from 'src/user/user.repository';
import { Profile } from '../user-profile/profile.entity';
import { UserIp } from 'src/user-ip-for-views/userIp.entity';
import { Repository } from 'typeorm';

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
        private readonly fileReaderService: FileReaderService,
    ) {}

    getMarkets(filterDto: StatusAndSearchFilterDto): Promise<Market[]> {
        return this.marketRepository.getMarkets(filterDto);
    }

    async getMarketById(id: string): Promise<Market> {
        return await this.marketRepository.getMarketById(id);
    }

    async getMarketByIdIncrementView(id: string, ipAddress: string): Promise<Market> {
        const market =  await this.marketRepository.getMarketByIdWithIps(id);
        if (market) {
            const userIp = new UserIp();
            userIp.ipAddress = ipAddress;
            const foundIp = await this.userIpRepository.findOne({ipAddress});
            if (foundIp) {
                userIp.id = foundIp.id;
            }
            if ( !market.userIpMarkets.find(x => x.ipAddress === ipAddress) ) {
                market.userIpMarkets.push(userIp);
                await market.save();
                this.marketRepository.incrementView(id);
            }
        }
        delete market.userIpMarkets;
        return market;
    }

    async getMarketsByCategory(filterDto: StatusAndSearchFilterDto, categoryId: string): Promise<Market[]> {
       return await this.marketRepository.getMarketsByCategory(filterDto, categoryId);
    }

    async getExchangesForMarket(id: string): Promise<Market> {
        return await this.marketRepository.getExchangesForMarket(id);
    }

    async getPartsForMarket(id: string): Promise<Market> {
        return await this.marketRepository.getPartsForMarket(id);
    }

    async getExchangesAndPartsForMarket(id: string): Promise<Market> {
        return await this.marketRepository.getExchangesAndPartsForMarket(id);
    }

    getTags(filterDto: StatusAndSearchFilterDto): Promise<Market[]> {
        return this.marketRepository.getTags(filterDto);
    }

    getTagsByCatId(id: string, filterDto: StatusAndSearchFilterDto): Promise<Market[]> {
        return this.marketRepository.getTagsByCatId(id, filterDto);
    }

    async createMarket(createMarketDto: CreateMarketDto, categoryId: string, images?: object[]): Promise<Market> {
        const category = await this.categoryRepository.getCategoryById(categoryId);
        const isMarketNameUnique = await this.marketRepository.isNameUnique(createMarketDto.name);
        const { tags } = createMarketDto;
        const processType = 'CREATE';
        const processedTags = await this.processTags(category.id, tags, processType);

        if ( isMarketNameUnique ) {
            if ( Array.isArray(images) && images.length > 0) {
                const s3ImageArray = await this.s3UploadService.uploadImageBatch(images, ImgFolder.MARKET_IMG_FOLDER);
                createMarketDto.images = s3ImageArray;
            }
            return this.marketRepository.createMarket(createMarketDto, category, processedTags);
        } else {
            throw new ConflictException('Market already exists');
        }
    }

    async deleteMarket(id: string): Promise<void> {
        const result = await this.marketRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Market with ID ${id} not found`);
        }
    }

    async updateMarketStatus(id: string, status: ListingStatus ): Promise<Market> {
        const market = await this.marketRepository.getMarketById(id);
        market.status = status;
        await market.save();
        return market;
    }

    async updateMarketTags(id: string, tags: string[] ): Promise<Market> {
        const market = await this.marketRepository.getMarketById(id);
        const processType = 'UPDATE';
        const processedTags = await this.processTags(market.categoryId, tags, processType);
        market.tags = processedTags;
        await market.save();
        return market;
    }

    async uploadMarketImage(id: string, image: any): Promise<void> {
        if (image) {
            const market = await this.marketRepository.getMarketById(id);
            if ( image ) {
                const s3ImgUrl = await this.s3UploadService.uploadImage(image, ImgFolder.MARKET_IMG_FOLDER);
                market.images.push(s3ImgUrl);
                await market.save();
            }
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

    async loadMarketsFile(filename: string): Promise<void> {
        Logger.log('Work in progress');
        this.fileReaderService.importMarketFileToDb(filename);
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

    async watchMarket(id: string, userId: string): Promise<void> {
        const mkt = await this.marketRepository.findOne({id});
        const user = await this.userRepository.findOne(userId, {relations: ['profile', 'profile.watchedMarkets']});
        const isntWatched = user.profile.watchedMarkets.findIndex(market => market.id === id) < 0;
        if (isntWatched) {
          user.profile.watchedMarkets.push(mkt);
          mkt.watchCount++;
          await this.userRepository.save(user);
          await this.marketRepository.save(mkt);
     }
    }

    async unWatchMarket(id: string, userId: string): Promise<void> {
        const mkt = await this.marketRepository.findOne({id});
        const user = await this.userRepository.findOne(userId, {relations: ['profile', 'profile.watchedMarkets']});
        const deleteIndex = user.profile.watchedMarkets.findIndex(market => market.id === id);
        if (deleteIndex >= 0) {
            user.profile.watchedMarkets.splice(deleteIndex, 1);
            mkt.watchCount--;
            await this.userRepository.save(user);
            await this.marketRepository.save(mkt);
        }
    }
}
