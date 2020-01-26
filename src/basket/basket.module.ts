import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../user-auth/auth.module';
import { ExchangeRepository } from '../market-exchange/exchange.repository';
import { UserRepository } from '../user/user.repository';
import { BasketController } from './basket.controller';
import { BasketService } from './basket.service';
import { BasketRepository } from './basket.repository';

@Module({
  imports: [TypeOrmModule.forFeature([BasketRepository, ExchangeRepository, UserRepository]), AuthModule],
  controllers: [BasketController],
  providers: [BasketService],
})
export class BasketModule {}
