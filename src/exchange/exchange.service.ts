import { Injectable, ConflictException, NotFoundException, NotAcceptableException, Logger, InternalServerErrorException } from '@nestjs/common';
import { MarketRepository } from 'src/market/market.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { ExchangeRepository } from './exchange.repository';
import { GenreRepository } from 'src/exchange-genre/genre.repository';
import { S3UploadService } from 'src/shared/services/awsS3Upload.service';
import { FileReaderService } from 'src/shared/services/csvFileReaders/fileReader.service';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { Exchange } from './exchange.entity';
import { CreateExchangeDto } from './dto/create-exchange-dto';
import { ImgFolder } from 'src/shared/enums/upload-img-folder.enum';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { Genre } from 'src/exchange-genre/genre.entity';
import { Uuid } from 'aws-sdk/clients/groundstation';
import { SubVariation } from '../exchange-sub-variation/sub-variation.entity';
import { SubVariationRepository } from 'src/exchange-sub-variation/sub-variation.repository';
import { UserRepository } from 'src/user/user.repository';
import { UserIp } from '../user-ip-for-views/userIp.entity';
import { Repository } from 'typeorm';

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
        @InjectRepository(UserIp)
        private readonly userIpRepository: Repository<UserIp>,
        private readonly s3UploadService: S3UploadService,
        private readonly fileReaderService: FileReaderService,
    ) {}

    getExchanges(filterDto: StatusAndSearchFilterDto): Promise<Exchange[]> {
        return this.exchangeRepository.getExchanges(filterDto);
    }

    async getExchangeById(id: string): Promise<Exchange> {
        return await this.exchangeRepository.getExchangeById(id);
    }

    async getExchangeByIdIncrementView(id: string, ipAddress: string): Promise<Exchange> {
        const exchange =  await this.exchangeRepository.getExchangeByIdWithIp(id);
        if (exchange) {
            const userIp = new UserIp();
            userIp.ipAddress = ipAddress;
            const foundIp = await this.userIpRepository.findOne({ipAddress});
            if (foundIp) {
                userIp.id = foundIp.id;
            }
            if ( !exchange.userIpExchanges.find(x => x.ipAddress === ipAddress) ) {
                exchange.userIpExchanges.push(userIp);
                await exchange.save();
                this.exchangeRepository.incrementView(id);
            }
        }
        delete exchange.userIpExchanges;
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

    async createExchange(createExchangeDto: CreateExchangeDto, marketId: string, images?: object[]): Promise<Exchange> {
        const market = await this.marketRepository.getMarketById(marketId);
        const isExchangeNameUnique = await this.exchangeRepository.isNameUnique(createExchangeDto.name);
        const { genres } = createExchangeDto;
        const processType = 'CREATE';
        let processedGenres: Genre[] = [];
        const { subVariations } = createExchangeDto;
        let processedSubVars: SubVariation[] = [];

        if (genres) {
            processedGenres = await this.processGenres(market.id, genres, processType);
        }

        if (subVariations) {
            processedSubVars = await this.processSubVariations(market.id, subVariations, processType);
        }

        if ( isExchangeNameUnique ) {
            if ( Array.isArray(images) && images.length > 0) {
                const s3ImageArray = await this.s3UploadService.uploadImageBatch(images, ImgFolder.EXCHANGE_IMG_FOLDER);
                createExchangeDto.images = s3ImageArray;
            }
            return this.exchangeRepository.createExchange(createExchangeDto, market, processedGenres, processedSubVars);
        } else {
            throw new ConflictException('Exchange already exists');
        }
    }

    async deleteExchange(id: string): Promise<void> {
        const result = await this.exchangeRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Exchange with ID ${id} not found`);
        }
    }

    async updateExchangeStatus(id: string, status: ListingStatus ): Promise<Exchange> {
        const market = await this.exchangeRepository.getExchangeById(id);
        market.status = status;
        await market.save();
        return market;
    }

    async updateExchangeGenres(id: string, genres: Genre[] ): Promise<Exchange> {
        const exchange = await this.exchangeRepository.getExchangeById(id);
        const processType = 'UPDATE';
        const processedGenres = await this.processGenres(exchange.marketId, genres, processType);
        exchange.genres = processedGenres;
        await exchange.save();
        return exchange;
    }

    async updateExchangeVariations(id: string, subVariations: SubVariation[] ): Promise<Exchange> {
        const exchange = await this.exchangeRepository.getExchangeById(id);
        const processType = 'UPDATE';
        const processedVars = await this.processGenres(exchange.marketId, subVariations, processType);
        exchange.subVariations = processedVars;
        await exchange.save();
        return exchange;
    }

    async uploadExchangeImage(id: string, image: any): Promise<void> {
        if (image) {
            const market = await this.exchangeRepository.getExchangeById(id);
            if ( image ) {
                const s3ImgUrl = await this.s3UploadService.uploadImage(image, ImgFolder.EXCHANGE_IMG_FOLDER);
                market.images.push(s3ImgUrl);
                await market.save();
            }
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

    async loadExchangesFile(filename: string): Promise<void> {
        Logger.log('Work in progress');
        this.fileReaderService.importExchangeFileToDb(filename);
    }

    async processGenres(mktId: Uuid, genres: Genre[], processType: string): Promise<Genre[]> {
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
            //    if ( (foundTag.categoryId === catId) && (processType.localeCompare('CREATE')) ) {
                   newGenre.id = foundGenre.id;
            //    } else {
            //        throw new ConflictException('This tag exists in another category / tags must be unique per category');
            //    }
            }
            newGenre.name = genre;
            newGenre.marketId = mktId;
            newGenres.push(newGenre);
        });
        await Promise.all(uploadPromises);
        return newGenres;
    }
    // getAllExchanges(): Exchange[] {
    //     const copiedExchanges = JSON.parse(JSON.stringify(this.Exchanges));
    //     return copiedExchanges;
    // }
    async processSubVariations(mktId: Uuid, subVariations: SubVariation[], processType: string): Promise<SubVariation[]> {
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
            //    if ( (foundTag.categoryId === catId) && (processType.localeCompare('CREATE')) ) {
                newVar.id = foundSubVar.id;
            //    } else {
            //        throw new ConflictException('This tag exists in another category / tags must be unique per category');
            //    }
            }
            newVar.name = subVar;
            newVar.marketId = mktId;
            newVars.push(newVar);
        });
        await Promise.all(uploadPromises);
        return newVars;
    }

    async watchExchange(id: string, userId: string): Promise<void> {
        const exch = await this.exchangeRepository.findOne({id});
        const user = await this.userRepository.findOne(userId, {relations: ['profile', 'profile.watchedExchanges']});
        const isntWatched = user.profile.watchedExchanges.findIndex(exchange => exchange.id === id) < 0;
        if (isntWatched) {
          user.profile.watchedExchanges.push(exch);
          exch.watchCount++;
          await this.userRepository.save(user);
          await this.exchangeRepository.save(exch);
     }
    }

    async unWatchExchange(id: string, userId: string): Promise<void> {
        const exch = await this.exchangeRepository.findOne({id});
        const user = await this.userRepository.findOne(userId, {relations: ['profile', 'profile.watchedExchanges']});
        const deleteIndex = user.profile.watchedExchanges.findIndex(exchange => exchange.id === id);
        if (deleteIndex >= 0) {
            user.profile.watchedExchanges.splice(deleteIndex, 1);
            exch.watchCount--;
            await this.userRepository.save(user);
            await this.exchangeRepository.save(exch);
        }
    }

    // async upvote(id: string, userId: string) {
    //     let exchange = await this.exchangeRepository.findOne({
    //       where: { id },
    //       relations: ['upvotes', 'downvotes'],
    //     });
    //     const user = await this.userRepository.findOne({ where: { id: userId } });
    //     exchange = await this.vote(exchange, user, ListingRating.UP);
    //     return this.exchangeToResponseObject(exchange);
    //   }

    // async downvote(id: string, userId: string) {
    //   let exchange = await this.exchangeRepository.findOne({
    //     where: { id },
    //     relations: ['upvotes', 'downvotes'],
    //   });
    //   const user = await this.userRepository.findOne({ where: { id: userId } });
    //   exchange = await this.vote(exchange, user, ListingRating.DOWN);
    //   return this.exchangeToResponseObject(exchange);
    // }

    // private exchangeToResponseObject(exchange: Exchange): Exchange {
    //     const responseObject: any = {
    //       ...exchange,
    //     };
    //     if (exchange.upvotes) {
    //       responseObject.upvotes = exchange.upvotes.length;
    //     }
    //     if (exchange.downvotes) {
    //       responseObject.downvotes = exchange.downvotes.length;
    //     }
    //     return responseObject;
    // }

    // private async vote(exchange: Exchange, user: UserEntity, vote: ListingRating): Promise<Exchange> {
    //     const opposite = vote === ListingRating.UP ? ListingRating.DOWN : ListingRating.UP;
    //     if (
    //       exchange[opposite].filter(voter => voter.id === user.id).length > 0 ||
    //       exchange[vote].filter(voter => voter.id === user.id).length > 0
    //     ) {
    //       exchange[opposite] = exchange[opposite].filter(voter => voter.id !== user.id);
    //       exchange[vote] = exchange[vote].filter(voter => voter.id !== user.id);
    //       await this.exchangeRepository.save(exchange);
    //     } else if (exchange[vote].filter(voter => voter.id === user.id).length < 1) {
    //       exchange[vote].push(user);
    //       await this.exchangeRepository.save(exchange);
    //     } else {
    //         throw new InternalServerErrorException('Failed to cast Vote...');
    //     }
    //     return exchange;
    // }
}

// async upvote(id: string, userId: string) {
//     let exchange = await this.exchangeRepository.findOne({
//       where: { id },
//       relations: ['upvotes', 'downvotes'],
//     });
//     const user = await this.userRepository.findOne({ where: { id: userId } });
//     exchange = await this.vote(exchange, user, ListingRating.UP);
//     return this.exchangeToResponseObject(exchange);
//   }

// async downvote(id: string, userId: string) {
//   let exchange = await this.exchangeRepository.findOne({
//     where: { id },
//     relations: ['upvotes', 'downvotes'],
//   });
//   const user = await this.userRepository.findOne({ where: { id: userId } });
//   exchange = await this.vote(exchange, user, ListingRating.DOWN);
//   return this.exchangeToResponseObject(exchange);
// }

// private exchangeToResponseObject(exchange: Exchange): Exchange {
//     const responseObject: any = {
//       ...exchange,
//     };
//     if (exchange.upvotes) {
//       responseObject.upvotes = exchange.upvotes.length;
//     }
//     if (exchange.downvotes) {
//       responseObject.downvotes = exchange.downvotes.length;
//     }
//     return responseObject;
// }

// private async vote(exchange: Exchange, user: UserEntity, vote: ListingRating): Promise<Exchange> {
//     const opposite = vote === ListingRating.UP ? ListingRating.DOWN : ListingRating.UP;
//     if (
//       exchange[opposite].filter(voter => voter.id === user.id).length > 0 ||
//       exchange[vote].filter(voter => voter.id === user.id).length > 0
//     ) {
//       exchange[opposite] = exchange[opposite].filter(voter => voter.id !== user.id);
//       exchange[vote] = exchange[vote].filter(voter => voter.id !== user.id);
//       await this.exchangeRepository.save(exchange);
//     } else if (exchange[vote].filter(voter => voter.id === user.id).length < 1) {
//       exchange[vote].push(user);
//       await this.exchangeRepository.save(exchange);
//     } else {
//         throw new InternalServerErrorException('Failed to cast Vote...');
//     }
//     return exchange;
// }
