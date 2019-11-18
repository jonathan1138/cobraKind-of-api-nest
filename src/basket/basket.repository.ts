import { EntityRepository, Repository } from 'typeorm';
import { Logger  } from '@nestjs/common';
import { Basket } from './basket.entity';

@EntityRepository(Basket)
export class BasketRepository extends Repository<Basket> {
    private logger = new Logger('BasketRepository');

}
