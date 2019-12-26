import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Market } from 'src/market/market.entity';
import { SubExchangeType } from '../shared/enums/sub-exchange-type.enum';

@Entity()
export class MarketShape {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  namingConvention: string;

  @Column({nullable: true})
  partsConvention: string;

  @Column({nullable: true})
  setConvention: string;

  @Column({ type: 'enum', enum: SubExchangeType })
  subExchangeType: SubExchangeType;

  @Column({nullable: true})
  subVariationConvention: string;

  @Column({nullable: true})
  subItemConvention: string;

  @Column({nullable: true})
  subModConvention: string;

  @OneToOne(() => Market, market => market.marketShape)
  market: Market;
}
