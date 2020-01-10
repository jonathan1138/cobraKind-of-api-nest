import { Injectable, ConflictException, NotFoundException, NotAcceptableException, Logger, InternalServerErrorException } from '@nestjs/common';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { S3UploadService } from 'src/shared/services/s3Uploader/awsS3Upload.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ExchangeRepository } from 'src/exchange/exchange.repository';
import { SubItemRepository } from './sub-item.repository';
import { SubItem } from './sub-item.entity';
import { CreateSubItemDto } from './dto/create-sub-item-dto';
import { ImgFolder } from 'src/shared/enums/upload-img-folder.enum';
import { UserRepository } from 'src/user/user.repository';
import { UserIp } from 'src/user-ip-for-views/userIp.entity';
import { Repository } from 'typeorm';
import { ListingStatusNote } from 'src/shared/enums/listing-status-note.enum';
import { YearCreated } from 'src/exchange-year/year.entity';
import { Manufacturer } from 'src/exchange-manufacturer/manufacturer.entity';
import { ManufacturerRepository } from 'src/exchange-manufacturer/manufacturer.repository';
import { YearCreatedRepository } from 'src/exchange-year/year.repository';

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
        @InjectRepository(YearCreatedRepository)
        private yearRepository: YearCreatedRepository,
        @InjectRepository(UserIp)
        private readonly userIpRepository: Repository<UserIp>,
        private readonly s3UploadService: S3UploadService,
    ) {}

    getSubItems(filterDto: StatusAndSearchFilterDto): Promise<SubItem[]> {
        return this.subItemRepository.getSubItems(filterDto);
    }

    async getSubItemById(id: string): Promise<SubItem> {
        return await this.subItemRepository.getSubItemById(id);
    }

    async getSubItemByIdIncrementView(id: string, ipAddress: string): Promise<SubItem> {
      const subItem =  await this.subItemRepository.getSubItemByIdWithIp(id);
      if (subItem) {
          const userIp = new UserIp();
          userIp.ipAddress = ipAddress;
          const foundIp = await this.userIpRepository.findOne({ipAddress});
          if (foundIp) {
              userIp.id = foundIp.id;
          }
          if ( !subItem.userIpSubItems.find(x => x.ipAddress === ipAddress) ) {
              subItem.userIpSubItems.push(userIp);
              await subItem.save();
              this.subItemRepository.incrementView(id);
          }
      }
      delete subItem.userIpSubItems;
      return subItem;
  }

    async getSubItemsByExchange(filterDto: StatusAndSearchFilterDto, exchangeId: string): Promise<SubItem[]> {
       return await this.subItemRepository.getSubItemsByExchange(filterDto, exchangeId);
    }

    async createSubItem(createSubItemDto: CreateSubItemDto, exchangeId: string, images?: object[], filenameInPath?: boolean): Promise<SubItem> {
        const exchange = await this.exchangeRepository.getExchangeById(exchangeId);
        let newYear = new YearCreated();
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
            throw new ConflictException('Exchange Not Found');
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
        subItem.status = status;
        if (!statusNote) {
            switch (subItem.status) {
                case ListingStatus.TO_REVIEW:
                  subItem.statusNote = ListingStatusNote.TO_REVIEW;
                  break;
                case ListingStatus.APPROVED:
                  subItem.statusNote = ListingStatusNote.APPROVED;
                  break;
                case ListingStatus.REJECTED:
                  subItem.statusNote = ListingStatusNote.REJECTED;
                  break;
                default:
                  subItem.statusNote = ListingStatusNote.TO_REVIEW;
                }
            } else {
            subItem.statusNote = statusNote;
        }
        await subItem.save();
        return subItem;
    }

    async uploadSubItemImage(id: string, image: any, filenameInPath?: boolean): Promise<void> {
        if (image) {
            const subItem = await this.subItemRepository.getSubItemById(id);
            if ( image ) {
                const s3ImgUrl = await this.s3UploadService.uploadImage(image, ImgFolder.MARKET_IMG_FOLDER, filenameInPath);
                subItem.images.push(s3ImgUrl);
                await subItem.save();
            }
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

    async watchSubItem(id: string, userId: string): Promise<void> {
        const sItem = await this.subItemRepository.findOne({id});
        const user = await this.userRepository.findOne(userId, {relations: ['profile', 'profile.watchedSubItems']});
        const isntWatched = user.profile.watchedSubItems.findIndex(subItem => subItem.id === id) < 0;
        if (isntWatched) {
          user.profile.watchedSubItems.push(sItem);
          sItem.watchCount++;
          await this.userRepository.save(user);
          await this.subItemRepository.save(sItem);
     }
    }

    async unWatchSubItem(id: string, userId: string): Promise<void> {
        const sItem = await this.subItemRepository.findOne({id});
        const user = await this.userRepository.findOne(userId, {relations: ['profile', 'profile.watchedSubItems']});
        const deleteIndex = user.profile.watchedSubItems.findIndex(subItem => subItem.id === id);
        if (deleteIndex >= 0) {
            user.profile.watchedSubItems.splice(deleteIndex, 1);
            sItem.watchCount--;
            await this.userRepository.save(user);
            await this.exchangeRepository.save(sItem);
        }
    }

    // async upvote(id: string, userId: string) {
    //     let subItem = await this.subItemRepository.findOne({
    //       where: { id },
    //       relations: ['upvotes', 'downvotes'],
    //     });
    //     const user = await this.userRepository.findOne({ where: { id: userId } });
    //     subItem = await this.vote(subItem, user, ListingRating.UP);
    //     return this.subItemToResponseObject(subItem);
    //   }

    // async downvote(id: string, userId: string) {
    //   let subItem = await this.subItemRepository.findOne({
    //     where: { id },
    //     relations: ['upvotes', 'downvotes'],
    //   });
    //   const user = await this.userRepository.findOne({ where: { id: userId } });
    //   subItem = await this.vote(subItem, user, ListingRating.DOWN);
    //   return this.subItemToResponseObject(subItem);
    // }

    // private subItemToResponseObject(subItem: SubItem): SubItem {
    //     const responseObject: any = {
    //       ...subItem,
    //     };
    //     if (subItem.upvotes) {
    //       responseObject.upvotes = subItem.upvotes.length;
    //     }
    //     if (subItem.downvotes) {
    //       responseObject.downvotes = subItem.downvotes.length;
    //     }
    //     return responseObject;
    // }

    // private async vote(subItem: SubItem, user: UserEntity, vote: ListingRating): Promise<SubItem> {
    //     const opposite = vote === ListingRating.UP ? ListingRating.DOWN : ListingRating.UP;
    //     if (
    //       subItem[opposite].filter(voter => voter.id === user.id).length > 0 ||
    //       subItem[vote].filter(voter => voter.id === user.id).length > 0
    //     ) {
    //       subItem[opposite] = subItem[opposite].filter(voter => voter.id !== user.id);
    //       subItem[vote] = subItem[vote].filter(voter => voter.id !== user.id);
    //       await this.subItemRepository.save(subItem);
    //     } else if (subItem[vote].filter(voter => voter.id === user.id).length < 1) {
    //       subItem[vote].push(user);
    //       await this.subItemRepository.save(subItem);
    //     } else {
    //         throw new InternalServerErrorException('Failed to cast Vote...');
    //     }
    //     return subItem;
    // }
}
