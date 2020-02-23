import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToOne, OneToMany } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { Market } from 'src/market/market.entity';
import { Tag } from 'src/market-tag/tag.entity';
import { PostEntity } from 'src/post/post.entity';
import { Exchange } from 'src/market-exchange/exchange.entity';
import { SubItem } from '../exchange-subs/exchange-sub-item/sub-item.entity';
import { SubMod } from '../exchange-subs/exchange-sub-mod/sub-mod.entity';
import { Part } from '../market-part/part.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({nullable: true})
  bio: string;

  @Column({nullable: true})
  interests: string;

  @Column({nullable: true})
  profilePhoto: string;

  @ManyToMany(() => Tag)
  @JoinTable()
  public watchedTags: Tag[];

  @ManyToMany(() => Market)
  @JoinTable()
  public watchedMarkets: Market[];

  @ManyToMany(() => Part)
  @JoinTable()
  public watchedParts: Part[];

  @ManyToMany(() => Exchange)
  @JoinTable()
  public watchedExchanges: Exchange[];

  @ManyToMany(() => SubItem)
  @JoinTable()
  public watchedSubItems: SubItem[];

  @ManyToMany(() => SubMod)
  @JoinTable()
  public watchedSubMods: SubMod[];

  @ManyToMany(() => PostEntity)
  @JoinTable()
  watchedPosts: PostEntity[];

  @ManyToMany(() => Tag)
  @JoinTable()
  public createdTags: Tag[];

  @ManyToMany(() => Market)
  @JoinTable()
  public createdMarkets: Market[];

  @ManyToMany(() => Part)
  @JoinTable()
  public createdParts: Part[];

  @ManyToMany(() => Exchange)
  @JoinTable()
  public createdExchanges: Exchange[];

  @ManyToMany(() => SubItem)
  @JoinTable()
  public createdSubItems: SubItem[];

  @ManyToMany(() => SubMod)
  @JoinTable()
  public createdSubMods: SubMod[];

  @OneToOne(() => UserEntity, user => user.profile)
  user: UserEntity;
}
