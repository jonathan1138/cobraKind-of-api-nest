import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToOne, OneToMany } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { Market } from 'src/market/market.entity';
import { Tag } from 'src/market-tag/tag.entity';
import { PostEntity } from 'src/post/post.entity';
import { Exchange } from 'src/exchange/exchange.entity';
import { SubItem } from '../exchange-sub-item/sub-item.entity';

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

  @ManyToMany(type => Tag)
  @JoinTable()
  public watchedTags: Tag[];

  @ManyToMany(type => Market)
  @JoinTable()
  public watchedMarkets: Market[];

  @ManyToMany(type => Exchange)
  @JoinTable()
  public watchedExchanges: Exchange[];

  @ManyToMany(type => SubItem)
  @JoinTable()
  public watchedSubItems: SubItem[];

  @ManyToMany(type => PostEntity, { cascade: true })
  @JoinTable()
  watchedPosts: PostEntity[];

  @OneToOne(type => UserEntity, user => user.profile)
  user: UserEntity;
}
