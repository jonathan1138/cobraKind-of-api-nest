import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreatePartDto {
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
    @IsNumber()
    year: number;

    @IsOptional()
    @IsString()
    manufacturer: string;
}
