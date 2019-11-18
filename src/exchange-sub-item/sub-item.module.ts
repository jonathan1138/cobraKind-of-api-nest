import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubItemService } from './sub-item.service';
import { SubItemController } from './sub-item.controller';
import { SubItemRepository } from './sub-item.repository';
import { ExchangeRepository } from 'src/exchange/exchange.repository';
import { S3UploadService } from 'src/shared/services/awsS3Upload.service';
import { FileReaderService } from 'src/shared/services/csvFileReaders/fileReader.service';
import { CategoryRepository } from 'src/category/category.repository';
import { MarketRepository } from 'src/market/market.repository';
import { GenreRepository } from 'src/exchange-genre/genre.repository';
import { PartRepository } from 'src/market-part/part.repository';
import { UserRepository } from 'src/user/user.repository';
import { UserIp } from '../user-ip-for-views/userIp.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryRepository, MarketRepository, ExchangeRepository,
    GenreRepository, PartRepository, SubItemRepository, UserRepository, UserIp]) ],
  controllers: [SubItemController],
  providers: [SubItemService, S3UploadService, FileReaderService],
})
export class SubItemModule {}
