import { Injectable, ConflictException, NotFoundException, NotAcceptableException, Logger } from '@nestjs/common';
import { S3UploadService } from 'src/shared/services/s3Uploader/awsS3Upload.service';
import { PartRepository } from './part.repository';
import { MarketRepository } from 'src/market/market.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { ImgFolder } from 'src/shared/enums/upload-img-folder.enum';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { Part } from './part.entity';
import { CreatePartDto } from './dto/create-part.dto';
import { ListingStatusNote } from 'src/shared/enums/listing-status-note.enum';
import { CreatedYear } from 'src/created-year/year.entity';
import { Manufacturer } from 'src/manufacturer/manufacturer.entity';
import { ManufacturerRepository } from 'src/manufacturer/manufacturer.repository';
import { CreatedYearRepository } from 'src/created-year/year.repository';
import { Exchange } from 'src/market-exchange/exchange.entity';
import { ExchangeRepository } from 'src/market-exchange/exchange.repository';
import { UserRepository } from 'src/user/user.repository';
import { UserLike } from 'src/user/entities/user-like.entity';
import { UserIp } from 'src/user-ip-for-views/user-ip.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PartService {
    constructor(
        @InjectRepository(MarketRepository)
        private marketRepository: MarketRepository,
        @InjectRepository(PartRepository)
        private partRepository: PartRepository,
        @InjectRepository(ManufacturerRepository)
        private manufacturerRepository: ManufacturerRepository,
        @InjectRepository(CreatedYearRepository)
        private yearRepository: CreatedYearRepository,
        @InjectRepository(ExchangeRepository)
        private exchangeRepository: ExchangeRepository,
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        @InjectRepository(UserIp)
        private readonly userIpRepository: Repository<UserIp>,
        private readonly s3UploadService: S3UploadService,
    ) {}

    getParts(filterDto: StatusAndSearchFilterDto, page: number = 1): Promise<Part[]> {
        return this.partRepository.getParts(filterDto, page);
    }

    async getPartById(id: string): Promise<Part> {
        return await this.partRepository.getPartById(id);
    }

    async getPartsByMarket(filterDto: StatusAndSearchFilterDto, marketId: string): Promise<Part[]> {
       return await this.partRepository.getPartsByMarket(filterDto, marketId);
    }

    async createPart(createPartDto: CreatePartDto, marketId: string, userId: string, images?: object[], filenameInPath?: boolean): Promise<Part> {
        let newYear = new CreatedYear();
        let newManufacturer = new Manufacturer();
        const market = await this.marketRepository.getMarketById(marketId);
        const foundYear = await this.yearRepository.checkYearByName(createPartDto.year);
        const foundManufacturer = await this.manufacturerRepository.checkManufacturerByName(createPartDto.manufacturer);
        if (foundYear) {
            newYear = foundYear;
        } else {
            const {year, era } = createPartDto;
            newYear.year = year;
            newYear.era = era;
        }
        if (foundManufacturer) {
            newManufacturer = foundManufacturer;
        } else {
            newManufacturer.name = createPartDto.name;
        }
        const isPartNameUnique = await this.partRepository.isNameUnique(createPartDto.name);

        if ( isPartNameUnique ) {
            if ( Array.isArray(images) && images.length > 0) {
                const s3ImageArray = await this.s3UploadService.uploadImageBatch(images, ImgFolder.PART_IMG_FOLDER, filenameInPath);
                createPartDto.images = s3ImageArray;
            }
            if (createPartDto.exchanges) {
                await this.processCreateExchangesArray(createPartDto.exchanges, market.id);
            }
            return this.partRepository.createPart(createPartDto, market, newYear, newManufacturer);
        } else {
            throw new ConflictException('Part already exists');
        }
    }

    async updatePartExchanges(id: string, exchanges: Exchange[] ): Promise<Part> {
        const part = await this.partRepository.findOne({id});
        if (exchanges) {
            const processedExchanges = await this.processCreateExchangesArray(exchanges, part.marketId);
            processedExchanges.length ? part.exchanges = processedExchanges : part.exchanges = [];
        } else {
            part.exchanges = [];
        }
        await part.save();
        return part;
    }

    async processCreateExchangesArray(exchanges: Exchange[], mktId: string): Promise<Exchange[]> {
        const newExchanges: Exchange[] = [];
        let assureArray = [];
        if ( !Array.isArray(exchanges) ) {
            assureArray.push(exchanges);
        } else {
            assureArray = [...exchanges];
        }
        const uploadPromises = assureArray.map(async (exchange) => {
            const foundExchange = await this.exchangeRepository.exchangeByName(exchange);
            if (foundExchange) {
                if (foundExchange.marketId === mktId) {
                    newExchanges.push(foundExchange);
                } else {
                    throw new NotAcceptableException(`Exchange must be a member of this Market`);
                }
            } else {
                throw new NotFoundException(`Exchange with ID not found`);
            }
        });
        await Promise.all(uploadPromises);
        return newExchanges;
    }

    async deletePart(id: string): Promise<void> {
        const result = await this.partRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Part with ID ${id} not found`);
        }
    }

    async updatePartStatus(id: string, status: ListingStatus, statusNote: string ): Promise<Part> {
        const part = await this.partRepository.getPartById(id);
        part.status = status;
        if (!statusNote) {
            switch (part.status) {
                case ListingStatus.REJECTED:
                  part.statusNote = ListingStatusNote.REJECTED;
                  break;
                default:
                  part.statusNote = null;
                }
            } else {
            part.statusNote = statusNote;
        }
        await part.save();
        return part;
    }

    async updatePart(id: string, createPartDto: CreatePartDto): Promise<void> {
        if ( createPartDto.name || createPartDto.info || createPartDto.manufacturer || createPartDto.year || createPartDto.era ) {
            let newYear = new CreatedYear();
            let newManufacturer = new Manufacturer();
            if (createPartDto.year || createPartDto.era) {
                const foundYear = await this.yearRepository.checkYearByName(createPartDto.year);
                if (foundYear) {
                    newYear = foundYear;
                    newYear.era = createPartDto.era;
                } else {
                    const {year, era } = createPartDto;
                    newYear.year = year;
                    newYear.era = era;
                }
            }
            if (createPartDto.manufacturer) {
                const foundManufacturer = await this.manufacturerRepository.checkManufacturerByName(createPartDto.manufacturer);
                if (foundManufacturer) {
                    newManufacturer = foundManufacturer;
                } else {
                    newManufacturer.name = createPartDto.manufacturer;
                }
            }
            return this.partRepository.updatePart(id, createPartDto, newYear, newManufacturer);
        } else {
          throw new NotAcceptableException(`Update details not provided`);
        }
    }

    async uploadPartImages(id: string, image: any, filenameInPath?: boolean): Promise<string[]> {
        if (image) {
            const part = await this.partRepository.getPartById(id);
            const s3ImgUrlArray = await this.s3UploadService.uploadImageBatch(image, ImgFolder.PART_IMG_FOLDER, filenameInPath);
            s3ImgUrlArray.forEach(item => {
                part.images.push(item);
            });
            await part.save();
            return part.images;
        } else {
            throw new NotAcceptableException(`File not found`);
        }
    }

    async deletePartImages(id: string): Promise<string[]> {
        const part = await this.partRepository.getPartById(id);
        let arrayImages: string[] = [];
        arrayImages = part.images;
        part.images = [];
        await part.save();
        return arrayImages;
    }

    async updateVote(userId: string, id: string): Promise<Part> {
        const part =  await this.partRepository.getPartById(id);
        const user = await this.userRepository.findOne(userId, {relations: ['likes']});
        const userLike = new UserLike();
        const isNewFavorite = user.likes.findIndex(item => item.id === part.id) < 0;
        if (isNewFavorite) {
            userLike.id = part.id;
            userLike.name = part.name;
            user.likes.push(userLike);
            part.likes++;
            await this.userRepository.save(user);
            return await part.save();
        } else {
            const deleteIndex = user.likes.findIndex(item => item.id === part.id);
            if (deleteIndex >= 0) {
                user.likes.splice(deleteIndex, 1);
                part.likes--;
                await this.userRepository.save(user);
                return await part.save();
            }
        }
    }

    async getPartByIdIncrementView(id: string, ipAddress: string): Promise<Part> {
        const part =  await this.partRepository.getPartByIdForViews(id);
        if (part) {
            const userIp = new UserIp();
            userIp.ipAddress = ipAddress;
            const foundIp = await this.userIpRepository.findOne({ipAddress});
            if (foundIp) {
                userIp.id = foundIp.id;
            }
            if ( !part.userIpViews.find(x => x.ipAddress === ipAddress) ) {
                part.userIpViews.push(userIp);
                part.views++;
                // this.exchangeRepository.incrementView(id);
                return await part.save();
            }
        }
        delete part.userIpViews;
        return part;
    }

    async watchPart(id: string, userId: string): Promise<Part> {
        const part = await this.partRepository.findOne({id});
        const user = await this.userRepository.findOne(userId, {relations: ['profile', 'profile.watchedParts']});
        const isntWatched = user.profile.watchedParts.findIndex(prt => prt.id === id) < 0;
        if (isntWatched) {
          user.profile.watchedParts.push(part);
          part.watchCount++;
          await this.userRepository.save(user);
          return await this.partRepository.save(part);
        }
    }

    async unWatchPart(id: string, userId: string): Promise<Part> {
        const part = await this.partRepository.findOne({id});
        const user = await this.userRepository.findOne(userId, {relations: ['profile', 'profile.watchedParts']});
        const deleteIndex = user.profile.watchedParts.findIndex(prt => prt.id === id);
        if (deleteIndex >= 0) {
            user.profile.watchedParts.splice(deleteIndex, 1);
            part.watchCount--;
            await this.userRepository.save(user);
            return await this.partRepository.save(part);
        }
    }

    // getAllParts(): Part[] {
    //     const copiedParts = JSON.parse(JSON.stringify(this.Parts));
    //     return copiedParts;
    // }
}
