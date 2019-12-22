import { IsNotEmpty, IsString, IsOptional, IsArray, IsEnum } from 'class-validator';

export class CreateMarketDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    tags: string[];

    @IsOptional()
    @IsString()
    info: string;

    @IsOptional()
    @IsArray()
    images: string[];
}
