import { Column, Entity, PrimaryGeneratedColumn, BaseEntity, OneToMany } from 'typeorm';
import { Exchange } from 'src/exchange/exchange.entity';
import { integer } from 'aws-sdk/clients/cloudfront';
import { SubItem } from 'src/exchange-sub-item/sub-item.entity';
import { Part } from '../market-part/part.entity';
import { SubMod } from 'src/exchange-sub-mod/sub-mod.entity';

@Entity()
export class CreatedYear extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({nullable: true})
    era: string;

    @Column({unique: true})
    year: integer;

    @OneToMany(() => Exchange, exchange => exchange.createdYear)
    exchanges: Exchange[];

    @OneToMany(() => SubItem, subItem => subItem.createdYear)
    subItems: SubItem[];

    @OneToMany(() => Part, part => part.createdYear)
    parts: Part[];

    @OneToMany(() => SubMod, subMod => subMod.createdYear)
    subMods: SubMod[];
}
