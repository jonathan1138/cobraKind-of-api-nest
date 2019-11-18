import { IsNotEmpty, IsString, IsOptional, IsArray, IsEnum, IsNumber, IsNumberString } from 'class-validator';
import { PostType } from '../../shared/enums/post-type.enum';

export class CreatePostDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsEnum(PostType)
    postType: PostType;

    @IsOptional()
    @IsArray()
    images: string[];

    @IsOptional()
    @IsNumberString()
    price: number;
}
