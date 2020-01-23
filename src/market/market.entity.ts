import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, ManyToMany,
    OneToOne, JoinColumn, OneToMany, JoinTable } from 'typeorm';
import { ListingStatus } from '../shared/enums/listing-status.enum';
import { Category } from 'src/category/category.entity';
import { Tag } from 'src/market-tag/tag.entity';
import { MarketShape } from '../market-shape/market-shape.entity';
import { Exchange } from 'src/exchange/exchange.entity';
import { Part } from 'src/market-part/part.entity';
import { UserIp } from 'src/user-ip-for-views/user-ip.entity';
import { PostEntity } from 'src/post/post.entity';
import { Genre } from 'src/exchange-genre/genre.entity';

@Entity()
@Unique(['name'])
export class Market extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true})
    name: string;

    @Column({nullable: true})
    info: string;

    @Column({ type: 'enum', enum: ListingStatus })
    status: ListingStatus;

    @Column({nullable: true})
    statusNote: string;

    @Column('simple-array', { default: '' })
    images: string[];

    @Column({ default: 0 })
    watchCount: number;

    @Column({ default: 0 })
    views: number;

    @ManyToOne(() => Category, category => category.markets, { eager: false } )
    category: Category;

    @Column('uuid')
    categoryId: string;

    @ManyToMany(() => Tag, (tag: Tag) => tag.markets, {
        cascade: true,
      })
    public tags: Tag[];

    @ManyToMany(() => Genre, (genre: Genre) => genre.markets, {
        cascade: true,
        nullable: true,
      })
    public genres: Genre[];

    @OneToMany(() => Exchange, exchange => exchange.market, { eager: false })
    exchanges: Exchange[];

    @OneToMany(() => Part, part => part.market, { eager: false })
    parts: Part[];

    @OneToOne(() => MarketShape, { // profile => profile.user,
        // onDelete: 'CASCADE', // this line does jack - nothing, but #3218 with typeorm
        // eager: true,
        cascade: ['insert', 'update' ],
    })
    @JoinColumn()
    marketShape: MarketShape;

    @ManyToMany(() => UserIp, { cascade: true })
    @JoinTable()
    userIpMarkets: UserIp[];

    @OneToMany(() => PostEntity, post => post.market, { eager: true })
    posts: PostEntity[];
}
