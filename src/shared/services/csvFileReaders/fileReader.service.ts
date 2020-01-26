import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
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
@Injectable()
export class FileReaderService {
    constructor(
        private categoryService: CategoryService,
        private marketService: MarketService,
        private tagService: TagService,
        private exchangeService: ExchangeService,
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

    async importPartFileToDb(filename: string) {
        const partReader = CategoryFileReader.fromCsv(filename);
        if ( partReader.load() === true ) {
            // const summary = FileSummary.winsAnalysisWithReport('Man United');
            // summary.buildAndPrintReport(exchangeReader.fileData);
            // const output = await this.processPartFileData(partReader.fileData);
        } else {
            Logger.log('Failed to import this file to database. Please check with admin');
        }
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
