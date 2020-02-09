import { Injectable, ConflictException, NotFoundException, NotAcceptableException } from '@nestjs/common';
import { MarketRepository } from 'src/market/market.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { ExchangeRepository } from './exchange.repository';
import { GenreRepository } from 'src/exchange-genre/genre.repository';
import { S3UploadService } from 'src/shared/services/s3Uploader/awsS3Upload.service';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { Exchange } from './exchange.entity';
import { CreateExchangeDto } from './dto/create-exchange-dto';
import { ImgFolder } from 'src/shared/enums/upload-img-folder.enum';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { Genre } from 'src/exchange-genre/genre.entity';
import { Uuid } from 'aws-sdk/clients/groundstation';
import { SubVariation } from '../exchange-subs/exchange-sub-variation/sub-variation.entity';
import { SubVariationRepository } from 'src/exchange-subs/exchange-sub-variation/sub-variation.repository';
import { UserRepository } from 'src/user/user.repository';
import { UserIp } from '../user-ip-for-views/user-ip.entity';
import { Repository } from 'typeorm';
import { ListingStatusNote } from 'src/shared/enums/listing-status-note.enum';
import { ProfileService } from 'src/user-profile/profile.service';
import { ManufacturerRepository } from 'src/manufacturer/manufacturer.repository';
import { CreatedYearRepository } from 'src/created-year/year.repository';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { CreatedYear } from 'src/created-year/year.entity';
import { UserLike } from 'src/user/entities/user-like.entity';

@Injectable()
export class ExchangeService {
    constructor(
        @InjectRepository(MarketRepository)
        private marketRepository: MarketRepository,
        @InjectRepository(ExchangeRepository)
        private exchangeRepository: ExchangeRepository,
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        @InjectRepository(GenreRepository)
        private genreRepository: GenreRepository,
        @InjectRepository(SubVariationRepository)
        private subVariationRepository: SubVariationRepository,
        @InjectRepository(ManufacturerRepository)
        private manufacturerRepository: ManufacturerRepository,
        @InjectRepository(CreatedYearRepository)
        private yearRepository: CreatedYearRepository,
        @InjectRepository(UserIp)
        private readonly userIpRepository: Repository<UserIp>,
        private readonly s3UploadService: S3UploadService,
        private readonly profileService: ProfileService,
    ) {}

    getExchanges(filterDto: StatusAndSearchFilterDto, page: number = 1): Promise<Exchange[]> {
        return this.exchangeRepository.getExchanges(filterDto, page);
    }

    async getExchangeById(id: string): Promise<Exchange> {
        return await this.exchangeRepository.getExchangeById(id);
    }

    async exchangeByName(name: string): Promise<Exchange> {
        return await this.exchangeRepository.exchangeByName(name);
    }

    async getExchangeByIdIncrementView(id: string, ipAddress: string): Promise<Exchange> {
        const exchange =  await this.exchangeRepository.getExchangeByIdForViews(id);
        if (exchange) {
            const userIp = new UserIp();
            userIp.ipAddress = ipAddress;
            const foundIp = await this.userIpRepository.findOne({ipAddress});
            if (foundIp) {
                userIp.id = foundIp.id;
            }
            if ( !exchange.userIpViews.find(x => x.ipAddress === ipAddress) ) {
                exchange.userIpViews.push(userIp);
                exchange.views++;
                // this.exchangeRepository.incrementView(id);
                return await exchange.save();
            }
        }
        delete exchange.userIpViews;
        return exchange;
    }

    async getExchangesByMarket(filterDto: StatusAndSearchFilterDto, marketId: string): Promise<Exchange[]> {
       return await this.exchangeRepository.getExchangesByMarket(filterDto, marketId);
    }

    async getExchangesWithSubItems(filterDto: StatusAndSearchFilterDto): Promise<Exchange[]> {
        return await this.exchangeRepository.getExchangesWithSubItems(filterDto);
     }

    getGenres(filterDto: StatusAndSearchFilterDto): Promise<Exchange[]> {
        return this.exchangeRepository.getGenres(filterDto);
    }

    getVariations(filterDto: StatusAndSearchFilterDto): Promise<Exchange[]> {
        return this.exchangeRepository.getVariations(filterDto);
    }

    getGenresByMktId(id: string, filterDto: StatusAndSearchFilterDto): Promise<Exchange[]> {
        return this.exchangeRepository.getGenresByMktId(id, filterDto);
    }

    getVarsByMktId(id: string, filterDto: StatusAndSearchFilterDto): Promise<Exchange[]> {
        return this.exchangeRepository.getVarsByMktId(id, filterDto);
    }

    async getSubItemsByExchangeId(filterDto: StatusAndSearchFilterDto, exchangeId: string): Promise<Exchange> {
        return await this.exchangeRepository.getSubItemsByExchangeId(filterDto, exchangeId);
     }

    async createExchange(createExchangeDto: CreateExchangeDto, marketId: string, userId: string,
                         images?: object[], filenameInPath?: boolean): Promise<Exchange> {
        let newYear = new CreatedYear();
        let newManufacturer = new Manufacturer();
        const market = await this.marketRepository.getMarketById(marketId);
        const foundExchange = await this.exchangeRepository.findOne({
            where: [
              { name: createExchangeDto.name },
            ],
          });
        if (foundExchange) {
            if (foundExchange.marketId === market.id) {
                throw new ConflictException('Exchange exists in this Market already!');
            }
        }
        const foundYear = await this.yearRepository.checkYearByName(createExchangeDto.year);
        if (foundYear) {
            newYear = foundYear;
        } else {
            const {year, era } = createExchangeDto;
            newYear.year = year;
            newYear.era = era;
        }
        const foundManufacturer = await this.manufacturerRepository.checkManufacturerByName(createExchangeDto.manufacturer);
        if (foundManufacturer) {
            newManufacturer = foundManufacturer;
        } else {
            newManufacturer.name = createExchangeDto.manufacturer;
        }
        const { genres } = createExchangeDto;
        const { subVariations } = createExchangeDto;
        let processedGenres: Genre[] = [];
        let processedSubVars: SubVariation[] = [];
        if (genres) {
            processedGenres = await this.processGenres(genres);
        }
        if (subVariations) {
            processedSubVars = await this.processSubVariations(market.id, subVariations);
        }
        if ( Array.isArray(images) && images.length > 0) {
            const s3ImageArray = await this.s3UploadService.uploadImageBatch(images, ImgFolder.EXCHANGE_IMG_FOLDER, filenameInPath);
            createExchangeDto.images = s3ImageArray;
        }
        const created = await this.exchangeRepository.createExchange(
            createExchangeDto, market, newYear, newManufacturer, processedGenres, processedSubVars,
        );
        this.profileService.updateCreatedExchanges(userId, created);
        return created;
    }

    async updateExchangeGenres(id: string, genres: Genre[] ): Promise<Exchange> {
        const exchange = await this.exchangeRepository.findOne({id});
        if (genres) {
            const processedGenres = await this.processGenres(genres);
            processedGenres.length ? exchange.genres = processedGenres : exchange.genres = [];
        } else {
            exchange.genres = [];
        }
        await exchange.save();
        return exchange;
    }

    async processGenres(genres: Genre[]): Promise<Genre[]> {
        const newGenres: Genre[] = [];
        let assureArray = [];
        if ( !Array.isArray(genres) ) {
            assureArray.push(genres);
        } else {
            assureArray = [...genres];
        }
        const uploadPromises = assureArray.map(async (genre, index: number) => {
            const newGenre = new Genre();
            const foundGenre = await this.genreRepository.genresByName(genre);
            if (foundGenre) {
                newGenre.id = foundGenre.id;
            }
            newGenre.name = genre;
            newGenre.status = ListingStatus.TO_REVIEW;
            newGenres.push(newGenre);
        });
        await Promise.all(uploadPromises);
        return newGenres;
    }

    async updateVote(userId: string, id: string): Promise<Exchange> {
        const exchange =  await this.exchangeRepository.getExchangeById(id);
        const user = await this.userRepository.findOne(userId, {relations: ['likes']});
        const userLike = new UserLike();
        const isNewFavorite = user.likes.findIndex(exch => exch.id === exchange.id) < 0;
        if (isNewFavorite) {
            userLike.id = exchange.id;
            userLike.name = exchange.name;
            user.likes.push(userLike);
            exchange.likes++;
            await this.userRepository.save(user);
            return await exchange.save();
        } else {
            const deleteIndex = user.likes.findIndex(exch => exch.id === exchange.id);
            if (deleteIndex >= 0) {
                user.likes.splice(deleteIndex, 1);
                exchange.likes--;
                await this.userRepository.save(user);
                return await exchange.save();
            }
        }
    }

    async deleteExchange(id: string): Promise<void> {
        const result = await this.exchangeRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Exchange with ID ${id} not found`);
        }
    }

    async updateExchangeStatus(id: string, status: ListingStatus, statusNote: string ): Promise<Exchange> {
        const exchange = await this.exchangeRepository.getExchangeById(id);
        exchange.status = status;
        if (!statusNote) {
            switch (exchange.status) {
                case ListingStatus.REJECTED:
                  exchange.statusNote = ListingStatusNote.REJECTED;
                  break;
                default:
                  exchange.statusNote = null;
                }
            } else {
            exchange.statusNote = statusNote;
        }
        await exchange.save();
        return exchange;
    }

    async updateExchangeVariations(id: string, subVariations: SubVariation[] ): Promise<Exchange> {
        const exchange = await this.exchangeRepository.getExchangeById(id);
        const processType = 'UPDATE';
        const processedVars = await this.processSubVariations(exchange.marketId, subVariations);
        exchange.subVariations = processedVars;
        await exchange.save();
        return exchange;
    }

    async updateExchange(id: string, createExchangeDto: CreateExchangeDto): Promise<void> {
        if ( createExchangeDto.name || createExchangeDto.info || createExchangeDto.manufacturer || createExchangeDto.year || createExchangeDto.era ) {
            let newYear = new CreatedYear();
            let newManufacturer = new Manufacturer();
            if (createExchangeDto.year || createExchangeDto.era) {
                const foundYear = await this.yearRepository.checkYearByName(createExchangeDto.year);
                if (foundYear) {
                    newYear = foundYear;
                    newYear.era = createExchangeDto.era;
                } else {
                    const {year, era } = createExchangeDto;
                    newYear.year = year;
                    newYear.era = era;
                }
            }
            if (createExchangeDto.manufacturer) {
                const foundManufacturer = await this.manufacturerRepository.checkManufacturerByName(createExchangeDto.manufacturer);
                if (foundManufacturer) {
                    newManufacturer = foundManufacturer;
                } else {
                    newManufacturer.name = createExchangeDto.manufacturer;
                }
            }
            return this.exchangeRepository.updateExchange(id, createExchangeDto, newYear, newManufacturer);
        } else {
          throw new NotAcceptableException(`Update details not provided`);
        }
    }

    async uploadExchangeImages(id: string, image: any, filenameInPath?: boolean): Promise<string[]> {
        if (image) {
            const exchange = await this.exchangeRepository.getExchangeById(id);
            const s3ImgUrlArray = await this.s3UploadService.uploadImageBatch(image, ImgFolder.EXCHANGE_IMG_FOLDER, filenameInPath);
            s3ImgUrlArray.forEach(item => {
                exchange.images.push(item);
            });
            await exchange.save();
            return exchange.images;
        } else {
            throw new NotAcceptableException(`File not found`);
        }
    }

    async deleteExchangeImages(id: string): Promise<string[]> {
        const market = await this.exchangeRepository.getExchangeById(id);
        let arrayImages: string[] = [];
        arrayImages = market.images;
        market.images = [];
        await market.save();
        return arrayImages;
    }

    // getAllExchanges(): Exchange[] {
    //     const copiedExchanges = JSON.parse(JSON.stringify(this.Exchanges));
    //     return copiedExchanges;
    // }
    async processSubVariations(mktId: Uuid, subVariations: SubVariation[]): Promise<SubVariation[]> {
        const newVars: SubVariation[] = [];
        let assureArray = [];
        if ( !Array.isArray(subVariations) ) {
            assureArray.push(subVariations);
        } else {
            assureArray = [...subVariations];
        }
        const uploadPromises = assureArray.map(async (subVar, index: number) => {
            const newVar = new SubVariation();
            const foundSubVar = await this.subVariationRepository.subVariationsByName(subVar);
            if (foundSubVar) {
                newVar.id = foundSubVar.id;
            }
            newVar.name = subVar;
            newVar.marketId = mktId;
            newVars.push(newVar);
        });
        await Promise.all(uploadPromises);
        return newVars;
    }

    async watchExchange(id: string, userId: string): Promise<Exchange> {
        const exch = await this.exchangeRepository.findOne({id});
        const user = await this.userRepository.findOne(userId, {relations: ['profile', 'profile.watchedExchanges']});
        const isntWatched = user.profile.watchedExchanges.findIndex(exchange => exchange.id === id) < 0;
        if (isntWatched) {
          user.profile.watchedExchanges.push(exch);
          exch.watchCount++;
          await this.userRepository.save(user);
          return await this.exchangeRepository.save(exch);
     }
    }

    async unWatchExchange(id: string, userId: string): Promise<Exchange> {
        const exch = await this.exchangeRepository.findOne({id});
        const user = await this.userRepository.findOne(userId, {relations: ['profile', 'profile.watchedExchanges']});
        const deleteIndex = user.profile.watchedExchanges.findIndex(exchange => exchange.id === id);
        if (deleteIndex >= 0) {
            user.profile.watchedExchanges.splice(deleteIndex, 1);
            exch.watchCount--;
            await this.userRepository.save(user);
            return this.exchangeRepository.save(exch);
        }
    }
}
