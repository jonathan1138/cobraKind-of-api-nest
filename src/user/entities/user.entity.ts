import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Unique, OneToOne, JoinColumn,
  OneToMany, CreateDateColumn, JoinTable, ManyToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { IsEmail } from 'class-validator';
import { Profile } from '../../user-profile/profile.entity';
import { UserRole } from './user-role.entity';
import { PostEntity } from 'src/post/post.entity';
import { UserRO } from '../dto/user-ro-dto';
import * as jwt from 'jsonwebtoken';
import * as config from 'config';
import { ListingRating } from 'src/exchange-listing-rating/listing-rating.entity';
import { Exclude } from 'class-transformer';
import { UserLike } from 'src/user/entities/user-like.entity';

@Entity()
@Unique(['name'])
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    created: Date;

    @Column()
    name: string;

    @Exclude()
    @Column()
    password: string;

    @Column({ nullable: true })
    @IsEmail()
    email?: string;

    @Column({ nullable: true })
    mobile?: string;

    @Column({default: false})
    profileCreated: boolean;

    @OneToOne(() => Profile, { // profile => profile.user,
        // onDelete: 'CASCADE', // this line does jack - nothing, but #3218 with typeorm
        // eager: true,
        cascade: ['insert', 'update' ],
    })
    @JoinColumn()
    profile: Profile;

    @OneToOne(() => UserRole, { // role => role.user,
       // onDelete: 'CASCADE', // this line does jack - nothing, but #3218 with typeorm
       // eager: true,
       cascade: ['insert', 'update' ],
    })
    @JoinColumn()
    role: UserRole;

    async validatePassword(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this.password);
    }

    @OneToMany(() => PostEntity, postEntity => postEntity.owner, { eager: true })
    posts: PostEntity[];

    @OneToMany(() => ListingRating, (listingRating) => listingRating.user)
    listingRatings!: ListingRating[];

    @ManyToMany(() => UserLike, { cascade: true, eager: true })
    @JoinTable()
    likes: UserLike[];

    toResponseObject(showToken: boolean = true): UserRO {
        const { id, created, name, token } = this;
        const responseObject: UserRO = {
          id,
          created,
          name,
        };

        if (this.posts) {
          responseObject.posts = this.posts;
        }

        if (this.profile.watchedPosts) {
          responseObject.watchedPosts = this.profile.watchedPosts;
        }

        if (showToken) {
          responseObject.token = token;
        }

        return responseObject;
      }

      private get token(): string {
        const { id, name } = this;

        return jwt.sign(
          {
            id,
            name,
          },
          process.env.JWT_SECRET || config.get('JWT.SECRET'),
          { expiresIn: '7d' },
        );
    }
}
