import { Module } from '@nestjs/common';
import { CategoryModule } from './category/category.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './srcConfig/typeorm.config';
import { AuthModule } from './user-auth/auth.module';
import { ApiModule } from './api.module';
import { UserModule } from './user/user.module';
import { MarketModule } from './market/market.module';
import { TagModule } from './market-tag/tag.module';
import { ProfileModule } from './user-profile/profile.module';
import { MarketShapeModule } from './market-shape/market-shape.module';
import { GenreModule } from './exchange-genre/genre.module';
import { ExchangeModule } from './market-exchange/exchange.module';
import { PartModule } from './market-part/part.module';
import { SubVariationModule } from './exchange-subs/exchange-sub-variation/sub-variation.module';
import { SubItemModule } from './exchange-subs/exchange-sub-item/sub-item.module';
import { SubModModule } from './exchange-subs/exchange-sub-mod/sub-mod.module';
import { PostModule } from './post/post.module';
import { ListingRatingModule } from './exchange-listing-rating/listing-rating.module';
import { BasketModule } from './basket/basket.module';
import { PriceRatingInfoModule } from './exchange-price-rating-info/price-rating-info.module';
import { HomeModule } from './home/home.module';
import { FileReaderModule } from './shared/services/csvFileReaders/fileReader.module';
import { CreatedYearModule } from './created-year/year.module';
import { ManufacturerModule } from './manufacturer/manufacturer.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    HomeModule,
    AuthModule,
    UserModule,
    CategoryModule,
    MarketModule,
    ApiModule,
    TagModule,
    ProfileModule,
    MarketShapeModule,
    ExchangeModule,
    SubVariationModule,
    SubItemModule,
    SubModModule,
    GenreModule,
    PartModule,
    PostModule,
    ListingRatingModule,
    BasketModule,
    PriceRatingInfoModule,
    FileReaderModule,
    CreatedYearModule,
    ManufacturerModule,
  ],
})
export class AppModule {}
