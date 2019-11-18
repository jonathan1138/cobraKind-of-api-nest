import { PipeTransform, BadRequestException, NotAcceptableException } from '@nestjs/common';
import { ListingStatus } from '../enums/listing-status.enum';

export class ListingStatusValidationPipe implements PipeTransform {
    readonly allowedmarketStatus = Object.values(ListingStatus);

    transform(value: any) {
        if (value) {
            value = value.toUpperCase();
            if (!this.isstatusValid(value)) {
                throw new BadRequestException(`"${value}" is an invalid status`);
            }
            return value;
        } else {
            throw new NotAcceptableException(`Invalid Body Value Supplied`);
        }
    }
    private isstatusValid(status: any) {
        const idx = this.allowedmarketStatus.indexOf(status);
        return idx !== -1;
    }
}

// export class categoryStatusValidationPipe1 implements PipeTransform {
//     transform(value: any) {
//         const input = value.toUpperCase();
//         const status: listingStatus = listingStatus[input as keyof typeof listingStatus];
//         if(!status) { throw new BadRequestException(`${input} is not a valid status.`); }
//         return status;
//     }
// }
