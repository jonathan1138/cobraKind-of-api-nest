import { IsString, MinLength, MaxLength, IsEmail, IsUUID, IsArray } from 'class-validator';
import { Tag } from '../../market-tag/tag.entity';
import { PreferredMarketDto } from 'src/user-profile/dto/preferred-market-dto';

export class PublicUserDto {

    @IsUUID()
    id: string;

    @IsString()
    @MinLength(2)
    @MaxLength(22)
    name: string;

    @IsEmail()
    @MinLength(7)
    @MaxLength(99)
    email: string;

    @IsString()
    @MinLength(10)
    @MaxLength(20)
    mobile: string;

    @IsUUID()
    profileId: string;

    @IsString()
    profileBio: string;

    @IsString()
    profileInterests: string;

    @IsString()
    profilePhoto: string;

    @IsArray()
    watchedTags: Tag[];

    @IsArray()
    watchedMarkets: PreferredMarketDto[];
}
