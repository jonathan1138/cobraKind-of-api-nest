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
import { ExchangeRepository } from 'src/market-exchange/exchange.repository';
import { PartRepository } from '../market-part/part.repository';
import { SubItemRepository } from '../exchange-subs/exchange-sub-item/sub-item.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileRepository, MarketRepository, SubItemRepository,
    ExchangeRepository, UserRepository, TagRepository, CategoryRepository, PartRepository]), AuthModule],
  controllers: [TagController],
  providers: [TagService, ProfileService],
})
export class TagModule {}
