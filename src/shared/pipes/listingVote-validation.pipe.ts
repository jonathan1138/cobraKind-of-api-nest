import { PipeTransform, BadRequestException, NotAcceptableException } from '@nestjs/common';
import { ListingVote } from '../enums/listing-vote.enum';

export class ListingVoteValidationPipe implements PipeTransform {
    readonly allowedVote = Object.values(ListingVote);

    transform(value: any) {
        if (value) {
            value = value.toUpperCase();
            if (!this.isVoteValid(value)) {
                throw new BadRequestException(`${value} is an invalid Vote`);
            }
            return value;
        } else {
            throw new NotAcceptableException(`Invalid Body Value Supplied`);
        }
    }
    private isVoteValid(vote: any) {
        const idx = this.allowedVote.indexOf(vote);
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
