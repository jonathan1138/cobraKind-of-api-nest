import { IsNotEmpty } from 'class-validator';

export class DeleteGenreDto {
    @IsNotEmpty()
    genres: string[];
}
