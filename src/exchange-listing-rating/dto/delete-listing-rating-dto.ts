import { IsNotEmpty } from 'class-validator';

export class DeleteListingRatingDto {
    @IsNotEmpty()
    listingratings: string[];
}
