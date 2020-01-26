import { IsNotEmpty, IsString, IsOptional, IsArray, IsInt, Min, Max } from 'class-validator';
import { Genre } from 'src/exchange-genre/genre.entity';
import { SubVariation } from 'src/exchange-subs/exchange-sub-variation/sub-variation.entity';
import { Transform } from 'class-transformer';
import { max } from 'rxjs/operators';

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
    // @Transform(parseInt)
    @Transform(value => Number.isNaN(+value) ? 0 : +value)
    @IsInt()
    @Min(1)
    @Max(2035)
    year: number;

    @IsOptional()
    @IsString()
    era: string;

    @IsOptional()
    @IsString()
    manufacturer: string;
}
