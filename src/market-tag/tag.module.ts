import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { TagRepository } from './tag.repository';
import { CategoryRepository } from '../category/category.repository';
import { AuthModule } from 'src/user-auth/auth.module';
import { ProfileService } from '../user-profile/profile.service';
import { ProfileModule } from '../user-profile/profile.module';
import { ProfileRepository } from 'src/user-profile/profile.repository';
import { UserRepository } from 'src/user/user.repository';
import { MarketRepository } from 'src/market/market.repository';
import { ExchangeRepository } from 'src/exchange/exchange.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileRepository, MarketRepository,
    ExchangeRepository, UserRepository, TagRepository, CategoryRepository]), AuthModule],
  controllers: [TagController],
  providers: [TagService, ProfileService],
})
export class TagModule {}
