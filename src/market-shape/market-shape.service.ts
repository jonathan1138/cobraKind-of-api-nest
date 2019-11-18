import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MarketShapeRepository } from './market-shape.repository';
import { MarketShape } from './market-shape.entity';
import { MarketRepository } from 'src/market/market.repository';
import { MarketShapeDto } from './dto/market-shape-dto';

@Injectable()
export class MarketShapeService {
    constructor(
        @InjectRepository(MarketShapeRepository) private marketShapeRepository: MarketShapeRepository,
        @InjectRepository(MarketRepository) private marketRepository: MarketRepository,
    ) {}

    async getMarketShapes(): Promise<MarketShape[]> {
        return this.marketShapeRepository.find();
    }

    async getMarketShapeByMarketId(id: string): Promise<MarketShape> {
        const market = await this.marketRepository.findOne({ id }, { relations: ['marketShape'] });
        if (market) {
            return market.marketShape;
        } else {
            throw new NotFoundException('Shape for this market not found');
        }
    }

    async updateMarketShape(id: string, marketShapeDto: MarketShapeDto): Promise<void> {
        const market = await this.marketRepository.findOne({ id }, { relations: ['marketShape'] });
        return this.marketShapeRepository.updateMarketShape(market, marketShapeDto);
    }
}
