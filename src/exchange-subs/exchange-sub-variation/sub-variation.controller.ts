import { Controller, Body, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { SubVariation } from './sub-variation.entity';
import { SubVariationService } from './sub-variation.service';

@Controller('subVariation')
export class SubVariationController {
    constructor( private subVariationService: SubVariationService ) {}

    @Get()
    subVariations(): Promise<SubVariation[]> {
        return this.subVariationService.allSubVariations();
    }

    @Get('/exchanges')
    allMarkets(): Promise<SubVariation[]> {
        return this.subVariationService.allMarkets();
    }

    @Get('/exchangeIds')
    exchangesBySubVariations(
        @Body('ids') ids: string[],
        ): Promise<SubVariation[]> {
        return this.subVariationService.exchangesBySubVariations(ids);
    }

    @Get('/:name')
    subVariationByName(@Param('name') name: string): Promise<SubVariation> {
        return this.subVariationService.subVariationsByName(name);
    }

    @Get('exchanges/:id')
    subVariationsForMarket(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<SubVariation[]> {
        return this.subVariationService.subVariationsForMarket(id);
    }

    @Get('/market/:id')
    getMarketById(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<SubVariation[]> {
        return this.subVariationService.subVariationsByMarket(id);
    }
}
