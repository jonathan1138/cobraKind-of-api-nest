import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';
import { Exchange } from 'src/market-exchange/exchange.entity';

export class CreatePartDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    info: string;

    @IsOptional()
    @IsArray()
    images: string[];

    @IsOptional()
    year: number;

    @IsOptional()
    era: string;

    @IsOptional()
    @IsString()
    manufacturer: string;

    @IsOptional()
    exchanges: Exchange[];
}
