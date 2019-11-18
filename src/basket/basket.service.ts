import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExchangeRepository } from '../exchange/exchange.repository';
import { UserRepository } from 'src/user/user.repository';
import { BasketRepository } from './basket.repository';

@Injectable()
export class BasketService {
    constructor(
        @InjectRepository(BasketRepository)
        private basketRepository: BasketRepository,
        @InjectRepository(ExchangeRepository)
        private exchangeRepository: ExchangeRepository,
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
    ) {}
}
