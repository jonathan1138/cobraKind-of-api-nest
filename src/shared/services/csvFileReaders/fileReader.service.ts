import { Injectable, Logger, NotAcceptableException } from '@nestjs/common';
import * as config from 'config';
import { CategoryFileReader } from './classes/categoryFileReader';
import { FileSummary } from './classes/fileSummary';
import { FileCategoryData } from './types/fileCategoryData';
import { ExchangeResult } from 'src/shared/enums/exchange-data.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryRepository } from 'src/category/category.repository';
import { MarketRepository } from 'src/market/market.repository';
import { FileMarketData } from './types/fileMarketData';
import { GenreRepository } from 'src/exchange-genre/genre.repository';
import { ExchangeRepository } from 'src/exchange/exchange.repository';
import { FileExchangeData } from './types/fileExchangeData';
import { FilePartData } from './types/filePartData';
import { PartRepository } from 'src/market-part/part.repository';

@Injectable()
export class FileReaderService {
    constructor(
        @InjectRepository(CategoryRepository)
        private categoryRepository: CategoryRepository,
        @InjectRepository(MarketRepository)
        private marketRepository: MarketRepository,
        @InjectRepository(ExchangeRepository)
        private exchangeRepository: ExchangeRepository,
        @InjectRepository(GenreRepository)
        private genreRepository: GenreRepository,
        @InjectRepository(PartRepository)
        private partRepository: PartRepository,
    ) {}

    async importCategoryFileToDb(filename: string) {
        const categoryReader = CategoryFileReader.fromCsv(filename);
        if ( categoryReader.load() === true ) {
            // const summary = FileSummary.winsAnalysisWithReport('Man United');
            // summary.buildAndPrintReport(exchangeReader.fileData);
            const output = await this.processCategoryFileData(categoryReader.fileData);
        } else {
            Logger.log('Failed to import this file to database. Please check with admin');
        }
    }

    async importMarketFileToDb(filename: string) {
        const marketReader = CategoryFileReader.fromCsv(filename);
        if ( marketReader.load() === true ) {
            // const summary = FileSummary.winsAnalysisWithReport('Man United');
            // summary.buildAndPrintReport(exchangeReader.fileData);
            const output = await this.processMarketFileData(marketReader.fileData);
        } else {
            Logger.log('Failed to import this file to database. Please check with admin');
        }
    }

    async importExchangeFileToDb(filename: string) {
        const exchangeReader = CategoryFileReader.fromCsv(filename);
        if ( exchangeReader.load() === true ) {
            // const summary = FileSummary.winsAnalysisWithReport('Man United');
            // summary.buildAndPrintReport(exchangeReader.fileData);
            const output = await this.processExchangeFileData(exchangeReader.fileData);
        } else {
            Logger.log('Failed to import this file to database. Please check with admin');
        }
    }

    async importPartFileToDb(filename: string) {
        const partReader = CategoryFileReader.fromCsv(filename);
        if ( partReader.load() === true ) {
            // const summary = FileSummary.winsAnalysisWithReport('Man United');
            // summary.buildAndPrintReport(exchangeReader.fileData);
            const output = await this.processPartFileData(partReader.fileData);
        } else {
            Logger.log('Failed to import this file to database. Please check with admin');
        }
    }

    async processCategoryFileData(categories: FileCategoryData[]): Promise<string> {
        let wins = 0;
        for (const match of categories) {
            // this.categoryRepository.delete('aaa');
            Logger.log('here');
            if (match[1] === 'Man United' && match[5] === ExchangeResult.HomeWin) {
                wins++;
            } else if (match[2] === 'Man United' && match[5] === ExchangeResult.AwayWin) {
                wins++;
            }
        }
        return `Team`;
    }

    async processMarketFileData(markets: FileMarketData[]): Promise<string> {
        let wins = 0;

        for (const match of markets) {
            // this.categoryRepository.delete('aaa');
            Logger.log('here');
            if (match[1] === 'Man United' && match[5] === ExchangeResult.HomeWin) {
                wins++;
            } else if (match[2] === 'Man United' && match[5] === ExchangeResult.AwayWin) {
                wins++;
            }
        }
        return `Team`;
    }

    async processExchangeFileData(exchanges: FileExchangeData[]): Promise<string> {
        let wins = 0;

        for (const match of exchanges) {
            // this.categoryRepository.delete('aaa');
            Logger.log('here');
            if (match[1] === 'Man United' && match[5] === ExchangeResult.HomeWin) {
                wins++;
            } else if (match[2] === 'Man United' && match[5] === ExchangeResult.AwayWin) {
                wins++;
            }
        }
        return `Team`;
    }

    async processPartFileData(parts: FilePartData[]): Promise<string> {
        let wins = 0;

        for (const match of parts) {
            // this.categoryRepository.delete('aaa');
            Logger.log('here');
            if (match[1] === 'Man United' && match[5] === ExchangeResult.HomeWin) {
                wins++;
            } else if (match[2] === 'Man United' && match[5] === ExchangeResult.AwayWin) {
                wins++;
            }
        }
        return `Team`;
    }
}
