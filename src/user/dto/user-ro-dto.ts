import { PostEntity } from 'src/post/post.entity';

export class UserRO {
    id: string;
    name: string;
    created: Date;
    token?: string;
    posts?: PostEntity[];
    watchedPosts?: PostEntity[];
}
