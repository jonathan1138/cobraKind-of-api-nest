import { Controller, ParseUUIDPipe, Param, Get } from '@nestjs/common';
import { PriceRatingInfoService } from './price-rating-info.service';
import { PriceRatingInfo } from './price-rating-info.entity';

// @UseGuards(AuthGuard())
@Controller('valueinfo')
export class PriceRatingInfoController {
constructor(private priceRatingInfoService: PriceRatingInfoService) {}

    @Get('')
    allPriceRatingInfo(): Promise<PriceRatingInfo[]> {
        return this.priceRatingInfoService.getPriceRatingInfo();
    }

    @Get('/:id')
    priceRatingById(@Param('id', new ParseUUIDPipe()) id: string): Promise<PriceRatingInfo> {
        return this.priceRatingInfoService.getPriceRatingById(id);
    }
}
