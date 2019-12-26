import { IsNotEmpty } from 'class-validator';

export class DeleteTagDto {
    @IsNotEmpty()
    tags: string[];
}
