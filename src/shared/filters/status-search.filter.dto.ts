import { ListingStatus } from '../enums/listing-status.enum';
import { IsOptional, IsIn, IsNotEmpty } from 'class-validator';

export class StatusAndSearchFilterDto {
    @IsOptional()
    @IsIn([ListingStatus.RECEIVED, ListingStatus.PENDING_REVIEW, ListingStatus.APPROVED])
    status: ListingStatus;

    @IsOptional()
    @IsNotEmpty()
    search: string;
}
