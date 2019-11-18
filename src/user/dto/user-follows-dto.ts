import { IsString, IsUUID } from 'class-validator';

export class UserFollowsDto {
    @IsUUID()
    followingId: string;

    @IsUUID()
    followerId: string;
}
