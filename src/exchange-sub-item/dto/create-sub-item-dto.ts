import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray } from 'class-validator';
import { integer } from 'aws-sdk/clients/cloudfront';

export class CreateSubItemDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    info: string;

    @IsOptional()
    @IsArray()
    images: string[];

    @IsOptional()
    year: integer;

    @IsOptional()
    era: string;

    @IsOptional()
    @IsString()
    manufacturer: string;
}
