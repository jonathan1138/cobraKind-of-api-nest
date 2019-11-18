import { Controller, Get, Patch, Param, Body, ParseUUIDPipe, ValidationPipe } from '@nestjs/common';
import { MarketShapeService } from './market-shape.service';
import { MarketShape } from './market-shape.entity';
import { MarketShapeDto } from './dto/market-shape-dto';

@Controller('marketshape')
export class MarketShapeController {
    constructor(private marketShapeService: MarketShapeService) {}

    @Get('')
    allMarketShapes(): Promise<MarketShape[]> {
        return this.marketShapeService.getMarketShapes();
    }

    @Get('/:id')
    marketShapeByMarketId(@Param('id', new ParseUUIDPipe()) id: string): Promise<MarketShape> {
        return this.marketShapeService.getMarketShapeByMarketId(id);
    }

    @Patch('/:id')
    updateMarketShape(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body(ValidationPipe) marketShapeDto: MarketShapeDto,
        ): Promise<void> {
            return this.marketShapeService.updateMarketShape(id, marketShapeDto);
    }
}
