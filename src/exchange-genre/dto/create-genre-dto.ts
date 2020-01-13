import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { Exchange } from '../../exchange/exchange.entity';

export class CreateGenreDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    exchanges: Exchange[];
}
