import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class CreateCategoryDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    info: string;

    @IsOptional()
    @IsArray()
    images: string[];
}
