import { Repository, EntityRepository } from 'typeorm';
import { MarketShape } from './market-shape.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { Market } from 'src/market/market.entity';
import { MarketShapeDto } from './dto/market-shape-dto';

@EntityRepository(MarketShape)
export class MarketShapeRepository extends Repository<MarketShape> {

    async updateMarketShape(market: Market, marketShapeDto: MarketShapeDto ): Promise<void> {
        const {
            namingConvention, partsConvention, setConvention,
            subExchangeType, subVariationConvention, subItemConvention,
            subModConvention } = marketShapeDto;

        market.marketShape.namingConvention = namingConvention;
        market.marketShape.partsConvention = partsConvention;
        market.marketShape.setConvention = setConvention;
        market.marketShape.subExchangeType = subExchangeType;
        market.marketShape.subVariationConvention = subVariationConvention;
        market.marketShape.subItemConvention = subItemConvention;
        market.marketShape.subModConvention = subModConvention;

        try {
            await market.save();
         } catch (error) {
            throw new InternalServerErrorException('Failed to update marketShape. Check with administrator');
        }
    }
}
