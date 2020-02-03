import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubItemService } from './sub-item.service';
import { SubItemController } from './sub-item.controller';
import { SubItemRepository } from './sub-item.repository';
import { ExchangeRepository } from 'src/market-exchange/exchange.repository';
import { S3UploadService } from 'src/shared/services/s3Uploader/awsS3Upload.service';
import { UserRepository } from 'src/user/user.repository';
import { UserIp } from '../../user-ip-for-views/user-ip.entity';
import { CreatedYearRepository } from '../../created-year/year.repository';
import { ManufacturerRepository } from '../../manufacturer/manufacturer.repository';
import { AuthModule } from 'src/user-auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ExchangeRepository, SubItemRepository, UserRepository, UserIp,
    CreatedYearRepository, ManufacturerRepository]), AuthModule],
  controllers: [SubItemController],
  providers: [SubItemService, S3UploadService],
})
export class SubItemModule {}
