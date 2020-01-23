import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { Exchange } from '../../exchange/exchange.entity';
import { Market } from '../../market/market.entity';

export class CreateGenreDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    markets: Market[];

    @IsOptional()
    exchanges: Exchange[];
}
