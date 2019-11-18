import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PreferredMarketDto {
    @Expose()
    id: string;

    @Expose()
    categoryId: string;

    @Expose()
    name: string;
}
