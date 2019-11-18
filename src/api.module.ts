import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { HttpErrorFilter } from './shared/filters/httpError.filter';
import { RoundTripInterceptor } from './shared/inteceptors/roundTrip.interceptor';
import { CategoryModule } from './category/category.module';
import { AuthModule } from './user-auth/auth.module';
import { UserModule } from './user/user.module';
import { MarketModule } from './market/market.module';
import { TagModule } from './market-tag/tag.module';
import { ProfileModule } from './user-profile/profile.module';
import { MarketShapeModule } from './market-shape/market-shape.module';
import { GenreModule } from './exchange-genre/genre.module';
import { ExchangeModule } from './exchange/exchange.module';
import { PartModule } from './market-part/part.module';
import { SubVariationModule } from './exchange-sub-variation/sub-variation.module';
import { SubItemModule } from './exchange-sub-item/sub-item.module';
import { SubModModule } from './exchange-sub-mod/sub-mod.module';
import { PostModule } from './post/post.module';
import { ListingRatingModule } from './exchange-listing-rating/listing-rating.module';
import { BasketModule } from './basket/basket.module';
import { PriceRatingInfoModule } from './exchange-price-rating-info/price-rating-info.module';
import { HomeModule } from './home/home.module';

@Module({
  imports: [HomeModule, AuthModule, UserModule, CategoryModule, MarketModule, MarketShapeModule, TagModule, BasketModule, PriceRatingInfoModule,
    ProfileModule, ExchangeModule, GenreModule, SubVariationModule, PartModule, SubItemModule, SubModModule, PostModule, ListingRatingModule],
  providers: [
    // {
    //   provide: APP_FILTER,
    //   useClass: HttpErrorFilter,
    // },
    {
      provide: APP_INTERCEPTOR,
      useClass: RoundTripInterceptor,
    },
  ],
  exports: [AuthModule, UserModule, CategoryModule, MarketModule, SubItemModule, SubModModule, ListingRatingModule, BasketModule,
     MarketShapeModule, TagModule, ProfileModule, ExchangeModule, GenreModule, SubVariationModule, PartModule, PostModule, PriceRatingInfoModule],
})
export class ApiModule {}
