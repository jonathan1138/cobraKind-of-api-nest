import { PipeTransform, BadRequestException, NotAcceptableException } from '@nestjs/common';
import { TagData } from '../enums/tag-data.enum';

export class TagDataValidationPipe implements PipeTransform {
    readonly allowedTag = Object.values(TagData);

    transform(value: any) {
        if (value) {
            // value = value.toUpperCase();
            if (!this.isTagValid(value)) {
                throw new BadRequestException(`"${value}" is an invalid status`);
            }
            return value;
        }
    }
    private isTagValid(tags: any) {
        let assureArray = [];
        if ( !Array.isArray(tags) ) {
            assureArray.push(tags);
        } else {
            assureArray = [...tags];
        }
        assureArray.forEach((tag) => {
            const idx = this.allowedTag.indexOf(tag);
            return idx !== -1;
        });
        return 1;
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
