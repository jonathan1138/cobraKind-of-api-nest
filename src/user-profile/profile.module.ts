import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../user/user.repository';
import { ProfileRepository } from './profile.repository';
import { AuthModule } from 'src/user-auth/auth.module';
import { S3UploadService } from 'src/shared/services/s3Uploader/awsS3Upload.service';
import { TagRepository } from '../market-tag/tag.repository';
import { MarketRepository } from 'src/market/market.repository';
import { ExchangeRepository } from '../market-exchange/exchange.repository';
import { PartRepository } from '../market-part/part.repository';

@Module({
    imports: [ TypeOrmModule.forFeature([ProfileRepository, UserRepository, TagRepository,
         MarketRepository, ExchangeRepository, PartRepository]), AuthModule ],
    controllers: [ProfileController],
    providers: [ProfileService, S3UploadService],
})
export class ProfileModule {}
