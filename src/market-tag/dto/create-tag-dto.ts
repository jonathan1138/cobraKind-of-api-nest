import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { Market } from '../../market/market.entity';

export class CreateTagDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    markets: Market[];
}
