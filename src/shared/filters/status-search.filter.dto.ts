import { ListingStatus } from '../enums/listing-status.enum';
import { IsOptional, IsIn, IsNotEmpty } from 'class-validator';
import { PostListingType } from '../enums/post-listing-type.enum';

export class StatusAndSearchFilterDto {
    @IsOptional()
    @IsIn([ListingStatus.TO_REVIEW, ListingStatus.APPROVED])
    status: ListingStatus;

    @IsOptional()
    @IsIn([PostListingType.EXCHANGE, PostListingType.PART, PostListingType.SUBITEM])
    listingType: PostListingType;

    @IsOptional()
    @IsNotEmpty()
    search: string;
}
