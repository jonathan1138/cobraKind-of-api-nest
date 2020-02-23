import { IsNotEmpty, IsString, IsOptional, IsArray, IsEnum, IsNumber, IsNumberString } from 'class-validator';
import { PostSide } from '../../shared/enums/post-side.enum';
import { PostCondition } from '../../shared/enums/post-condition.enum';
import { PostListingType } from '../../shared/enums/post-listing-type.enum';

export class CreatePostDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsEnum(PostListingType)
    postListingType: PostListingType;

    @IsNotEmpty()
    @IsEnum(PostSide)
    side: PostSide;

    @IsNotEmpty()
    @IsEnum(PostCondition)
    condition: PostCondition;

    @IsOptional()
    @IsArray()
    images: string[];

    @IsOptional()
    @IsNumberString()
    price: number;
}
