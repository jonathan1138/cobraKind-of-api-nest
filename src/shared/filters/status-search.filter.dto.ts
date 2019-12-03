import { ListingStatus } from '../enums/listing-status.enum';
import { IsOptional, IsIn, IsNotEmpty } from 'class-validator';

export class StatusAndSearchFilterDto {
    @IsOptional()
    @IsIn([ListingStatus.TO_REVIEW, ListingStatus.APPROVED])
    status: ListingStatus;

    @IsOptional()
    @IsNotEmpty()
    search: string;
}
