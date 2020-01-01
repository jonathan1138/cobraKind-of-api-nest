import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubItemService } from './sub-item.service';
import { SubItemController } from './sub-item.controller';
import { SubItemRepository } from './sub-item.repository';
import { ExchangeRepository } from 'src/exchange/exchange.repository';
import { S3UploadService } from 'src/shared/services/s3Uploader/awsS3Upload.service';
import { UserRepository } from 'src/user/user.repository';
import { UserIp } from '../user-ip-for-views/userIp.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExchangeRepository, SubItemRepository, UserRepository, UserIp]) ],
  controllers: [SubItemController],
  providers: [SubItemService, S3UploadService],
})
export class SubItemModule {}
