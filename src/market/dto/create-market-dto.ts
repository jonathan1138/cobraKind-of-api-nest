import { IsNotEmpty, IsString, IsOptional, IsArray, IsEnum } from 'class-validator';

export class CreateMarketDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    tags: string[];

    @IsOptional()
    @IsString()
    info: string;

    @IsOptional()
    @IsArray()
    images: string[];
}
