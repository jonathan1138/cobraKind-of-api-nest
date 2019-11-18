import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray } from 'class-validator';
import { Genre } from 'src/exchange-genre/genre.entity';
import { SubVariation } from 'src/exchange-sub-variation/sub-variation.entity';

export class CreateExchangeDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    genres: Genre[];

    @IsOptional()
    subVariations: SubVariation[];

    @IsOptional()
    @IsString()
    info: string;

    @IsOptional()
    @IsArray()
    images: string[];

    @IsOptional()
    @IsNumber()
    year: number;

    @IsOptional()
    @IsString()
    manufacturer: string;
}
