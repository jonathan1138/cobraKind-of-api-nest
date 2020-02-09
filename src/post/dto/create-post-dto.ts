import { IsNotEmpty, IsString, IsOptional, IsArray, IsEnum, IsNumber, IsNumberString } from 'class-validator';
import { PostType } from '../../shared/enums/post-type.enum';
import { PostCondition } from '../../shared/enums/post-condition.enum';

export class CreatePostDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsEnum(PostType)
    type: PostType;

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
