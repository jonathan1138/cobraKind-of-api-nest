import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class CreateYearDto {
    @IsNotEmpty()
    year: number;

    @IsOptional()
    @IsString()
    era: string;
}
