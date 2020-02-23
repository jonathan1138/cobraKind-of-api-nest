import { Injectable, ConflictException, NotFoundException, NotAcceptableException, Logger, InternalServerErrorException } from '@nestjs/common';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { S3UploadService } from 'src/shared/services/s3Uploader/awsS3Upload.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ExchangeRepository } from 'src/market-exchange/exchange.repository';
import { SubItemRepository } from './sub-item.repository';
import { SubItem } from './sub-item.entity';
import { CreateSubItemDto } from './dto/create-sub-item-dto';
import { ImgFolder } from 'src/shared/enums/upload-img-folder.enum';
import { UserRepository } from 'src/user/user.repository';
import { UserIp } from 'src/user-ip-for-views/user-ip.entity';
import { Repository } from 'typeorm';
import { ListingStatusNote } from 'src/shared/enums/listing-status-note.enum';
import { CreatedYear } from 'src/created-year/year.entity';
import { Manufacturer } from 'src/manufacturer/manufacturer.entity';
import { ManufacturerRepository } from 'src/manufacturer/manufacturer.repository';
import { CreatedYearRepository } from 'src/created-year/year.repository';
import { UserLike } from 'src/user/entities/user-like.entity';

@Injectable()
export class SubItemService {
    constructor(
        @InjectRepository(SubItemRepository)
        private subItemRepository: SubItemRepository,
        @InjectRepository(ExchangeRepository)
        private exchangeRepository: ExchangeRepository,
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        @InjectRepository(ManufacturerRepository)
        private manufacturerRepository: ManufacturerRepository,
        @InjectRepository(CreatedYearRepository)
        private yearRepository: CreatedYearRepository,
        @InjectRepository(UserIp)
        private readonly userIpRepository: Repository<UserIp>,
        private readonly s3UploadService: S3UploadService,
    ) {}

    getSubItems(filterDto: StatusAndSearchFilterDto, page: number = 1): Promise<SubItem[]> {
        return this.subItemRepository.getSubItems(filterDto, page);
    }

    async getSubItemById(id: string): Promise<SubItem> {
        return await this.subItemRepository.getSubItemById(id);
    }

    async subItemByName(name: string): Promise<SubItem> {
        return await this.subItemRepository.subItemByName(name);
    }

    async getSubItemByIdIncrementView(id: string, ipAddress: string): Promise<SubItem> {
      const subItem =  await this.subItemRepository.getSubItemByIdForViews(id);
      if (subItem) {
          const userIp = new UserIp();
          userIp.ipAddress = ipAddress;
          const foundIp = await this.userIpRepository.findOne({ipAddress});
          if (foundIp) {
              userIp.id = foundIp.id;
          }
          if ( !subItem.userIpViews.find(x => x.ipAddress === ipAddress) ) {
              subItem.userIpViews.push(userIp);
              subItem.views++;
              return await subItem.save();
          }
      }
      delete subItem.userIpViews;
      return subItem;
  }

    async getSubItemsByExchange(filterDto: StatusAndSearchFilterDto, exchangeId: string): Promise<SubItem[]> {
       return await this.subItemRepository.getSubItemsByExchange(filterDto, exchangeId);
    }

    async createSubItem(createSubItemDto: CreateSubItemDto, exchangeId: string,
                        userId: string, images?: object[], filenameInPath?: boolean): Promise<SubItem> {
        const exchange = await this.exchangeRepository.getExchangeById(exchangeId);
        const foundSubExchange = await this.subItemRepository.findOne({
            where: [
              { name: createSubItemDto.name },
            ],
          });
        if (foundSubExchange) {
            if (foundSubExchange.exchangeId === exchange.id) {
                throw new ConflictException('SubItem exists in this Exchange already!');
            }
        }
        let newYear = new CreatedYear();
        let newManufacturer = new Manufacturer();
        const foundYear = await this.yearRepository.checkYearByName(createSubItemDto.year);
        const foundManufacturer = await this.manufacturerRepository.checkManufacturerByName(createSubItemDto.manufacturer);
        if (foundYear) {
            newYear = foundYear;
        } else {
            const {year, era } = createSubItemDto;
            newYear.year = year;
            newYear.era = era;
        }
        if (foundManufacturer) {
            newManufacturer = foundManufacturer;
        } else {
            newManufacturer.name = createSubItemDto.name;
        }
        if ( exchange ) {
            if ( Array.isArray(images) && images.length > 0) {
                const s3ImageArray = await this.s3UploadService.uploadImageBatch(images, ImgFolder.SUBITEM_IMG_FOLDER, filenameInPath);
                createSubItemDto.images = s3ImageArray;
            }
            return this.subItemRepository.createSubItem(createSubItemDto, exchange, newYear, newManufacturer);
        } else {
            throw new ConflictException('xChange Not Found');
        }
    }

    async deleteSubItem(id: string): Promise<void> {
        const result = await this.subItemRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`SubItem with ID ${id} not found`);
        }
    }

    async updateSubItemStatus(id: string, status: ListingStatus, statusNote: string ): Promise<SubItem> {
        const subItem = await this.subItemRepository.getSubItemById(id);
        subItem.status = status;
        if (!statusNote) {
            switch (subItem.status) {
                case ListingStatus.REJECTED:
                  subItem.statusNote = ListingStatusNote.REJECTED;
                  break;
                default:
                  subItem.statusNote = null;
                }
            } else {
            subItem.statusNote = statusNote;
        }
        await subItem.save();
        return subItem;
    }

    async updateSubItem(id: string, createSubItemDto: CreateSubItemDto): Promise<void> {
        if ( createSubItemDto.name || createSubItemDto.info || createSubItemDto.manufacturer || createSubItemDto.year || createSubItemDto.era ) {
            let newYear = new CreatedYear();
            let newManufacturer = new Manufacturer();
            if (createSubItemDto.year || createSubItemDto.era) {
                const foundYear = await this.yearRepository.checkYearByName(createSubItemDto.year);
                if (foundYear) {
                    newYear = foundYear;
                    newYear.era = createSubItemDto.era;
                } else {
                    const {year, era } = createSubItemDto;
                    newYear.year = year;
                    newYear.era = era;
                }
            }
            if (createSubItemDto.manufacturer) {
                const foundManufacturer = await this.manufacturerRepository.checkManufacturerByName(createSubItemDto.manufacturer);
                if (foundManufacturer) {
                    newManufacturer = foundManufacturer;
                } else {
                    newManufacturer.name = createSubItemDto.manufacturer;
                }
            }
            return this.subItemRepository.updateSubItem(id, createSubItemDto, newYear, newManufacturer);
        } else {
          throw new NotAcceptableException(`Update details not provided`);
        }
    }

    async uploadSubItemImages(id: string, image: any, filenameInPath?: boolean): Promise<string[]> {
        if (image) {
            const subItem = await this.subItemRepository.getSubItemById(id);
            const s3ImgUrlArray = await this.s3UploadService.uploadImageBatch(image, ImgFolder.SUBITEM_IMG_FOLDER, filenameInPath);
            s3ImgUrlArray.forEach(item => {
                subItem.images.push(item);
            });
            await subItem.save();
            return subItem.images;
        } else {
            throw new NotAcceptableException(`File not found`);
        }
    }

    async deleteSubItemImages(id: string): Promise<string[]> {
        const subItem = await this.subItemRepository.getSubItemById(id);
        let arrayImages: string[] = [];
        arrayImages = subItem.images;
        subItem.images = [];
        await subItem.save();
        return arrayImages;
    }

    async watchSubItem(id: string, userId: string): Promise<SubItem> {
        const sItem = await this.subItemRepository.findOne({id});
        const user = await this.userRepository.findOne(userId, {relations: ['profile', 'profile.watchedSubItems']});
        const isntWatched = user.profile.watchedSubItems.findIndex(subItem => subItem.id === id) < 0;
        if (isntWatched) {
          user.profile.watchedSubItems.push(sItem);
          sItem.watchCount++;
          await this.userRepository.save(user);
          return await this.subItemRepository.save(sItem);
     }
    }

    async unWatchSubItem(id: string, userId: string): Promise<SubItem> {
        const sItem = await this.subItemRepository.findOne({id});
        const user = await this.userRepository.findOne(userId, {relations: ['profile', 'profile.watchedSubItems']});
        const deleteIndex = user.profile.watchedSubItems.findIndex(subItem => subItem.id === id);
        if (deleteIndex >= 0) {
            user.profile.watchedSubItems.splice(deleteIndex, 1);
            sItem.watchCount--;
            await this.userRepository.save(user);
            return await this.subItemRepository.save(sItem);
        }
    }

    async updateVote(userId: string, id: string): Promise<SubItem> {
        const subItem = await this.subItemRepository.getSubItemById(id);
        const user = await this.userRepository.findOne(userId, {relations: ['likes']});
        const userLike = new UserLike();
        const isNewFavorite = user.likes.findIndex(subI => subI.id === subItem.id) < 0;
        if (isNewFavorite) {
            userLike.id = subItem.id;
            userLike.name = subItem.name;
            user.likes.push(userLike);
            subItem.likes++;
            await this.userRepository.save(user);
            return await subItem.save();
        } else {
            const deleteIndex = user.likes.findIndex(subI => subI.id === subItem.id);
            if (deleteIndex >= 0) {
                user.likes.splice(deleteIndex, 1);
                subItem.likes--;
                await this.userRepository.save(user);
                return await subItem.save();
            }
        }
    }
}
