import { IsNotEmpty } from 'class-validator';

export class CreateManufacturerDto {
    @IsNotEmpty()
    name: string;
}
