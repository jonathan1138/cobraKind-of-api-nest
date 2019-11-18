import { Controller } from '@nestjs/common';
import { BasketService } from './basket.service';

// @UseGuards(AuthGuard())
@Controller('listingRating')
export class BasketController {
constructor(private basketService: BasketService) {}

}
