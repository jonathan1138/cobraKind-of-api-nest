import { IsNotEmpty, IsString, IsOptional, IsArray, IsInt, Min, Max } from 'class-validator';
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
    // @IsInt()
    // @Min(4)
    // @Max(4)
    year: number;

    @IsOptional()
    // @IsInt()
    // @Min(4)
    // @Max(4)
    era: string;

    @IsOptional()
    @IsString()
    manufacturer: string;
}
