import { IsNotEmpty, IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { TagData } from '../../shared/enums/tag-data.enum';

export class CreateMarketDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEnum(TagData, {each: true})
    tags: TagData[];

    @IsOptional()
    @IsString()
    info: string;

    @IsOptional()
    @IsArray()
    images: string[];
}
