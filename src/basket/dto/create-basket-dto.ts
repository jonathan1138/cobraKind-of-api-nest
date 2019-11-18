import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class CreateBasketDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    info: string;
}
