import { Injectable, Logger, InternalServerErrorException, Post } from '@nestjs/common';
import { CategoryFileReader } from './classes/categoryFileReader';
import { FileCategoryData } from './types/fileCategoryData';
import { CreateCategoryDto } from '../../../category/dto/create-category-dto';
import { MarketFileReader } from './classes/marketFileReader';
import { CategoryService } from 'src/category/category.service';
import { MarketService } from 'src/market/market.service';
import { CreateMarketDto } from 'src/market/dto/create-market-dto';
import { FileMarketData } from './types/fileMarketData';
import { TagService } from '../../../market-tag/tag.service';
import { TagFileReader } from './classes/tagFileReader';
import { CreateTagDto } from 'src/market-tag/dto/create-tag-dto';
import { FileTagData } from './types/fileTagData';
import { CreateExchangeDto } from 'src/market-exchange/dto/create-exchange-dto';
import { ExchangeService } from 'src/market-exchange/exchange.service';
import { FileExchangeData } from './types/fileExchangeData';
import { ExchangeFileReader } from './classes/exchangeFileReader';
import { PartService } from 'src/market-part/part.service';
import { FilePartData } from './types/filePartData';
import { CreatePartDto } from 'src/market-part/dto/create-part.dto';
import { PartFileReader } from './classes/partFileReader';
import { CreateSubItemDto } from 'src/exchange-subs/exchange-sub-item/dto/create-sub-item-dto';
import { FileSubItemData } from './types/fileSubItemData';
import { SubItemFileReader } from './classes/subItemFileReader';
import { SubItemService } from 'src/exchange-subs/exchange-sub-item/sub-item.service';
import { PostService } from 'src/post/post.service';
import { FilePostData } from './types/filePostData';
import { CreatePostDto } from 'src/post/dto/create-post-dto';
import { PostFileReader } from './classes/postFileReader';
import { UserService } from '../../../user/user.service';
import { PostSide } from 'src/shared/enums/post-side.enum';
import { PostCondition } from '../../enums/post-condition.enum';
import { PostListingType } from 'src/shared/enums/post-listing-type.enum';
@Injectable()
export class FileReaderService {
    constructor(
        private categoryService: CategoryService,
        private marketService: MarketService,
        private tagService: TagService,
        private exchangeService: ExchangeService,
        private subItemService: SubItemService,
        private partService: PartService,
        private postService: PostService,
        private userService: UserService,
    ) {}
    private logger = new Logger('FileReaderService');
    private userId = 'd86eafeb-f7b1-443b-809b-57454ec9e208';
    private tagCatId = '6e28157d-0dcf-4aed-adfa-938db705419a';

    async importCategoryFileToDb(filename: string) {
        const categoryReader = CategoryFileReader.fromCsv(filename);
        if ( categoryReader.load() === true ) {
            const output = await this.processCategoryFileData(categoryReader.fileData);
        } else {
            Logger.log('Failed to import this file to database. Please check with admin');
        }
    }

    async processCategoryFileData(categories: FileCategoryData[]): Promise<string> {
        let recordSuccess = 0;
        let recordFail = 0;
        for (const item of categories) {
            // process image array
            let imageArray = [];
            if (item[2].length) {
                imageArray = item[2].split('|');
            }
            const category: CreateCategoryDto = {
                    name: item[0],
                    info: item[1],
                    images: imageArray,
                };
            try {
                const result = await this.categoryService.createCategory(category);
                recordSuccess++;
            } catch (error) {
                recordFail++;
                this.logger.error(`Failed to create a Category: `, error.stack);
                // throw new InternalServerErrorException();
            }
        }
        const report = `Processed ${recordSuccess} records successfully / ${recordFail} failed`;
        Logger.log(report);
        return report;
    }

    async importMarketFileToDb(filename: string): Promise<string> {
        const marketReader = MarketFileReader.fromCsv(filename);
        if ( marketReader.load() === true ) {
            return await this.processMarketFileData(marketReader.fileData);
        } else {
            const importError = 'Failed to import this file to database. Please check with admin';
            Logger.log(importError);
            return importError;
        }
    }

    async processMarketFileData(markets: FileMarketData[]): Promise<string> {
        let recordSuccess = 0;
        const processedMarkets = markets.map(async (item) => {
            let imageArray = [];
            if (item[2].length) {
                imageArray = item[2].split('|');
            }
            let tagsArray = [];
            if (item[3].length) {
                tagsArray = item[3].split('|');
            }
            const market: CreateMarketDto = {
                    name: item[0],
                    info: item[1],
                    images: imageArray,
                    tags: tagsArray,
                };
            try {
                await this.marketService.createMarket(market, item[4], this.userId)
                .then((res) => {
                    recordSuccess++;
                });
            } catch (error) {
                this.logger.error(`Failed to find a Market: `, error.stack);
                // throw new InternalServerErrorException();
            }
        });
        const result = await Promise.all(processedMarkets)
        .then(() => {
            return recordSuccess;
        });
        const report = `Processed ${result} records out of ${markets.length}`;
        Logger.log(report);
        return report;
    }

    async importTagFileToDb(filename: string): Promise<string>  {
        const tagReader = TagFileReader.fromCsv(filename);
        if ( tagReader.load() === true ) {
            return await this.processTagFileData(tagReader.fileData);
        } else {
            const importError = 'Failed to import this file to database. Please check with admin';
            Logger.log(importError);
            return importError;
        }
    }

    async processTagFileData(tags: FileTagData[]): Promise<string> {
        let recordSuccess = 0;

        const processedTags = tags.map(async (item) => {
            const tag: CreateTagDto = {
                name: item[0],
                markets: [],
            };
            try {
                await this.tagService.createTag(tag, this.tagCatId, this.userId)
                .then((res) => {
                    recordSuccess++;
                });
            } catch (error) {
                this.logger.error(`Failed to find a Tag: `, error.stack);
                // throw new InternalServerErrorException();
            }
        });
        const result = await Promise.all(processedTags)
        .then(() => {
            return recordSuccess;
        });
        const report = `Processed ${result} records out of ${tags.length}`;
        Logger.log(report);
        return report;
    }

    async importPartFileToDb(filename: string): Promise<string> {
        const partReader = PartFileReader.fromCsv(filename);
        if ( partReader.load() === true ) {
            return await this.processPartFileData(partReader.fileData);
        } else {
            const importError = 'Failed to import this file to database. Please check with admin';
            Logger.log(importError);
            return importError;
        }
    }

    async processPartFileData(parts: FilePartData[]): Promise<string>  {
        let recordSuccess = 0;
        let mktId = '';
        const processedParts = parts.map(async (item) => {
            let imageArray = [];
            if (item[2].length) {
                imageArray = item[2].split('|');
            }
            let exchangesArray = [];
            if (item[7].length) {
                exchangesArray = item[7].split('|');
            }
            const createdYear = parseInt(item[4], 10);
            const part: CreatePartDto = {
                name: item[0],
                info: item[1],
                images: imageArray,
                exchanges: exchangesArray,
                manufacturer: item[3],
                year: createdYear,
                era: item[5],
            };
            try {
                await this.marketService.marketIdByName(item[6])
                .then((res) => {
                    mktId = res;
                });
            } catch (error) {
                this.logger.error(`Failed to find a Market: `, error.stack);
                // throw new InternalServerErrorException();
            }
            try {
                await this.partService.createPart(part, mktId, this.userId);
                recordSuccess++;
            } catch (error) {
                this.logger.error(`Failed to create an Part: `, error.stack);
                // throw new InternalServerErrorException();
            }
        });
        const result = await Promise.all(processedParts)
        .then(() => {
            return recordSuccess;
        });
        const report = `Processed ${result} records out of ${parts.length}`;
        Logger.log(report);
        return report;
    }

    async importExchangeFileToDb(filename: string): Promise<string> {
        const exchangeReader = ExchangeFileReader.fromCsv(filename);
        if ( exchangeReader.load() === true ) {
            return await this.processExchangeFileData(exchangeReader.fileData);
        } else {
            const importError = 'Failed to import this file to database. Please check with admin';
            Logger.log(importError);
            return importError;
        }
    }

    async processExchangeFileData(exchanges: FileExchangeData[]): Promise<string>  {
        let recordSuccess = 0;
        let mktId = '';
        const processedExchanges = exchanges.map(async (item) => {
            let imageArray = [];
            if (item[2].length) {
                imageArray = item[2].split('|');
            }
            let genresArray = [];
            if (item[3].length) {
                genresArray = item[3].split('|');
            }
            const createdYear = parseInt(item[5], 10);
            const exchange: CreateExchangeDto = {
                name: item[0],
                info: item[1],
                images: imageArray,
                genres: genresArray,
                manufacturer: item[4],
                year: createdYear,
                era: item[6],
                subVariations: [],
            };
            try {
                await this.marketService.marketIdByName(item[7])
                .then((res) => {
                    mktId = res;
                });
            } catch (error) {
                // this.logger.error(`Failed to find a Market: `, error.stack);
                // throw new InternalServerErrorException();
            }
            try {
                await this.exchangeService.createExchange(exchange, mktId, this.userId);
                recordSuccess++;
            } catch (error) {
                this.logger.error(`Failed to create an Exchange: `, error.stack);
                // throw new InternalServerErrorException();
            }
        });
        const result = await Promise.all(processedExchanges)
        .then(() => {
            return recordSuccess;
        });
        const report = `Processed ${result} records out of ${exchanges.length}`;
        Logger.log(report);
        return report;
    }

    async importSubItemFileToDb(filename: string): Promise<string> {
        const subItemReader = SubItemFileReader.fromCsv(filename);
        if ( subItemReader.load() === true ) {
            return await this.processSubItemFileData(subItemReader.fileData);
        } else {
            const importError = 'Failed to import this file to database. Please check with admin';
            Logger.log(importError);
            return importError;
        }
    }

    async processSubItemFileData(subItems: FileSubItemData[]): Promise<string>  {
        let recordSuccess = 0;
        let exchId = '';
        const processedSubItems = subItems.map(async (item) => {
            let imageArray = [];
            if (item[2].length) {
                imageArray = item[2].split('|');
            }
            const createdYear = parseInt(item[4], 10);
            const subItem: CreateSubItemDto = {
                name: item[0],
                info: item[1],
                images: imageArray,
                manufacturer: item[3],
                year: createdYear,
                era: item[5],
            };
            try {
                const shaveNewLine = item[6].replace(/(\r\n|\n|\r)/gm, '');
                await this.exchangeService.exchangeByName(shaveNewLine)
                .then((res) => {
                    exchId = res.id;
                });
            } catch (error) {
                // this.logger.error(`Failed to find a Exchange: `, error.stack);
                // throw new InternalServerErrorException();
            }
            try {
                await this.subItemService.createSubItem(subItem, exchId, this.userId);
                recordSuccess++;
            } catch (error) {
                // this.logger.error(`Failed to create an SubItem: `, error.stack);
                // throw new InternalServerErrorException();
            }
        });
        const result = await Promise.all(processedSubItems)
        .then(() => {
            return recordSuccess;
        });
        const report = `Processed ${result} records out of ${subItems.length}`;
        Logger.log(report);
        return report;
    }

    async importPostFileToDb(filename: string): Promise<string> {
        const postReader = PostFileReader.fromCsv(filename);
        if ( postReader.load() === true ) {
            return await this.processPostFileData(postReader.fileData);
        } else {
            const importError = 'Failed to import this file to database. Please check with admin';
            Logger.log(importError);
            return importError;
        }
    }

    async processPostFileData(posts: FilePostData[]): Promise<string>  {
        let recordSuccess = 0;
        let listingTypeId = '';
        const user = await this.userService.getUserById(this.userId);
        const processedPosts = posts.map(async (item) => {
            let imageArray = [];
            if (item[3].length) {
                imageArray = item[3].split('|');
            }
            const postSide = item[6] === 'Cobra' ? PostSide.COBRA : PostSide.KIND;
            let postCondition = PostCondition.ACCEPTABLE;
            switch (item[7]) {
                case 'ACCEPTABLE':
                    postCondition = PostCondition.ACCEPTABLE;
                    break;
                case 'BRAND_NEW_BOX':
                    postCondition = PostCondition.BRAND_NEW_BOX;
                    break;
                case 'BRAND_NEW_TAGS':
                    postCondition = PostCondition.BRAND_NEW_TAGS;
                    break;
                case 'GOOD':
                    postCondition = PostCondition.GOOD;
                    break;
                case 'LIKE_NEW':
                    postCondition = PostCondition.LIKE_NEW;
                    break;
                case 'NEW':
                    postCondition = PostCondition.NEW;
                    break;
                case 'NOT_WORKING':
                    postCondition = PostCondition.NOT_WORKING;
                    break;
                case 'VERY_GOOD':
                    postCondition = PostCondition.VERY_GOOD;
                    break;
                default:
                    postCondition = PostCondition.ACCEPTABLE;
            }
            const filePrice = parseInt(item[5], 10);
            const post: CreatePostDto = {
                title: item[0],
                description: item[4],
                images: imageArray,
                price: filePrice,
                side: postSide,
                condition: postCondition,
                postListingType: PostListingType.EXCHANGE,
            };
            try {
                const shaveNewLine = item[2].replace(/(\r\n|\n|\r)/gm, '');
                switch (item[1]) {
                    case 'Exchange':
                        post.postListingType = PostListingType.EXCHANGE;
                        await this.exchangeService.exchangeByName(shaveNewLine)
                        .then((res) => {
                            listingTypeId = res.id;
                        });
                        await this.postService.createPost(post, listingTypeId, user);
                        recordSuccess++;
                        break;
                    case 'Part':
                        post.postListingType = PostListingType.PART;
                        await this.partService.partByName(shaveNewLine)
                        .then((res) => {
                            listingTypeId = res.id;
                        });
                        await this.postService.createPost(post, listingTypeId, user);
                        recordSuccess++;
                        break;
                    case 'SubItem':
                        post.postListingType = PostListingType.SUBITEM;
                        await this.subItemService.subItemByName(shaveNewLine)
                        .then((res) => {
                            listingTypeId = res.id;
                        });
                        await this.postService.createPost(post, listingTypeId, user);
                        recordSuccess++;
                        break;
                }
            } catch (error) {
                this.logger.error(`Failed to find an Entity: `, error.stack);
                // throw new InternalServerErrorException();
            }
        });
        const result = await Promise.all(processedPosts)
        .then(() => {
            return recordSuccess;
        });
        const report = `Processed ${result} records out of ${posts.length}`;
        Logger.log(report);
        return report;
    }

    // async processExchangeFileData(exchanges: FileExchangeData[]): Promise<string> {
    //     let wins = 0;

    //     for (const match of exchanges) {
    //         // this.categoryRepository.delete('aaa');
    //         Logger.log('here');
    //         if (match[1] === 'Man United' && match[5] === ExchangeResult.HomeWin) {
    //             wins++;
    //         } else if (match[2] === 'Man United' && match[5] === ExchangeResult.AwayWin) {
    //             wins++;
    //         }
    //     }
    //     return `Team`;
    // }

    // async processPartFileData(parts: FilePartData[]): Promise<string> {
    //     let wins = 0;

    //     for (const match of parts) {
    //         // this.categoryRepository.delete('aaa');
    //         Logger.log('here');
    //         if (match[1] === 'Man United' && match[5] === ExchangeResult.HomeWin) {
    //             wins++;
    //         } else if (match[2] === 'Man United' && match[5] === ExchangeResult.AwayWin) {
    //             wins++;
    //         }
    //     }
    //     return `Team`;
    // }
}
