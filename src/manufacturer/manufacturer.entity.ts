import { Column, Entity, PrimaryGeneratedColumn, BaseEntity, OneToMany } from 'typeorm';
import { Exchange } from 'src/market-exchange/exchange.entity';
import { SubItem } from 'src/exchange-subs/exchange-sub-item/sub-item.entity';
import { Part } from '../market-part/part.entity';
import { SubMod } from '../exchange-subs/exchange-sub-mod/sub-mod.entity';

@Entity()
export class Manufacturer extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true})
    name: string;

    @OneToMany(() => Exchange, exchange => exchange.manufacturer)
    exchanges: Exchange[];

    @OneToMany(() => SubItem, subItem => subItem.manufacturer)
    subItems: SubItem[];

    @OneToMany(() => Part, part => part.manufacturer)
    parts: Part[];

    @OneToMany(() => SubMod, subMod => subMod.manufacturer)
    subMods: SubMod[];
}
