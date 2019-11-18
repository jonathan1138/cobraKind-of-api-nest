import { Module } from '@nestjs/common';
import { FileReaderService } from './fileReader.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryRepository } from 'src/category/category.repository';
import { MarketRepository } from 'src/market/market.repository';
import { ExchangeRepository } from '../../../exchange/exchange.repository';
import { GenreRepository } from 'src/exchange-genre/genre.repository';
import { PartRepository } from 'src/market-part/part.repository';
import { SubItemRepository } from 'src/exchange-sub-item/sub-item.repository';

@Module({
    imports: [ TypeOrmModule.forFeature([CategoryRepository, MarketRepository, ExchangeRepository,
        GenreRepository, PartRepository, SubItemRepository]) ],
    providers: [FileReaderService],
})
export class FileReaderModule {}
