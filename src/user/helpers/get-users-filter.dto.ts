import { IsOptional, IsNotEmpty } from 'class-validator';

export class GetUsersFilterDto {
    @IsOptional()
    @IsNotEmpty()
    search: string;
}
