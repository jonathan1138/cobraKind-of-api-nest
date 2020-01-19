import { Injectable, Logger } from '@nestjs/common';
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
import { CreateExchangeDto } from 'src/exchange/dto/create-exchange-dto';
import { ExchangeService } from 'src/exchange/exchange.service';
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
    private userId = '260a7b48-e60a-4d0a-ac26-0d7186215542';

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
                    if (result) { recordSuccess++; }
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

    async importMarketFileToDb(filename: string) {
        const marketReader = MarketFileReader.fromCsv(filename);
        if ( marketReader.load() === true ) {
            const output = await this.processMarketFileData(marketReader.fileData);
        } else {
            Logger.log('Failed to import this file to database. Please check with admin');
        }
    }

    async processMarketFileData(markets: FileMarketData[]): Promise<string> {
        let recordSuccess = 0;
        let recordFail = 0;
        for (const item of markets) {
            // process image array
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
                    const result = await this.marketService.createMarket(market, item[4], this.userId);
                    if (result) { recordSuccess++; }
                } catch (error) {
                    recordFail++;
                    this.logger.error(`Failed to create a Market: `, error.stack);
                    // throw new InternalServerErrorException();
                }
        }
        const report = `Processed ${recordSuccess} records successfully / ${recordFail}`;
        Logger.log(report);
        return report;
    }

    async importTagFileToDb(filename: string) {
        const tagReader = TagFileReader.fromCsv(filename);
        if ( tagReader.load() === true ) {
            const output = await this.processTagFileData(tagReader.fileData);
        } else {
            Logger.log('Failed to import this file to database. Please check with admin');
        }
    }

    async processTagFileData(tags: FileTagData[]): Promise<string> {
        let recordSuccess = 0;
        let recordFail = 0;
        for (const item of tags) {
            // process image array
            const tag: CreateTagDto = {
                    name: item[0],
                    markets: []
                };
            try {
                    const result = await this.tagService.createTag(tag, item[1], this.userId);
                    if (result) { recordSuccess++; }
                } catch (error) {
                    recordFail++;
                    this.logger.error(`Failed to create a Tag: `, error.stack);
                    // throw new InternalServerErrorException();
                }
        }
        const report = `Processed ${recordSuccess} records successfully / ${recordFail} failed`;
        Logger.log(report);
        return report;
    }

    async importExchangeFileToDb(filename: string) {
        const exchangeReader = ExchangeFileReader.fromCsv(filename);
        if ( exchangeReader.load() === true ) {
            const output = await this.processExchangeFileData(exchangeReader.fileData);
        } else {
            Logger.log('Failed to import this file to database. Please check with admin');
        }
    }

    async processExchangeFileData(exchanges: FileExchangeData[]): Promise<string> {
        let recordSuccess = 0;
        let recordFail = 0;
        for (const item of exchanges) {
            // process image array
            let imageArray = [];
            if (item[2].length) {
                imageArray = item[2].split('|');
            }
            let tagsArray = [];
            if (item[3].length) {
                tagsArray = item[3].split('|');
            }
            // const exchange: CreateExchangeDto = {
            //         name: item[0],
            //         info: item[1],
            //         images: imageArray,
            //         genres: genresArray,
            //     };
            // try {
            //         const result = await this.exchangeService.createExchange(exchange, item[4], this.userId);
            //         if (result) { recordSuccess++; }
            //     } catch (error) {
            //         recordFail++;
            //         this.logger.error(`Failed to create an Exchange: `, error.stack);
            //         // throw new InternalServerErrorException();
            //     }
        }
        const report = `Processed ${recordSuccess} records successfully / ${recordFail}`;
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
