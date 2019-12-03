import { IsString, IsOptional, IsEnum, Length, IsNumber, Max } from 'class-validator';

export class CreateListingRatingDto {
    @IsOptional()
    @IsString()
    @Length(3, 255)
    comment: string;

    rating: number;
}
