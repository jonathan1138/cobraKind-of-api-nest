import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExchangeRepository } from '../market-exchange/exchange.repository';
import { UserRepository } from 'src/user/user.repository';
import { PriceRatingInfoRepository } from './price-rating-info.repository';
import { PriceRatingInfo } from './price-rating-info.entity';

@Injectable()
export class PriceRatingInfoService {
    constructor(
        @InjectRepository(PriceRatingInfoRepository)
        private priceRatingInfoRepository: PriceRatingInfoRepository,
        @InjectRepository(ExchangeRepository)
        private exchangeRepository: ExchangeRepository,
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
    ) {}

    async getPriceRatingInfo(): Promise<PriceRatingInfo[]> {
        return this.priceRatingInfoRepository.find();
    }

    async getPriceRatingById(id: string): Promise<PriceRatingInfo> {
        const exchange = await this.exchangeRepository.getExchangeById(id);
        const priceInfo = await this.priceRatingInfoRepository.findOne(exchange.id);
        if (priceInfo) {
            return priceInfo;
        } else {
            throw new NotFoundException('Profile for User Id Supplied not found');
        }
    }
}
