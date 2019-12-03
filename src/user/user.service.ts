import { Injectable, NotFoundException, Logger, NotAcceptableException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserInfoDto } from './dto/user-info-dto';
import { UserRepository } from './user.repository';
import { UserFollowsDto } from './dto/user-follows-dto';
import { FollowsEntity } from './entities/follows.entity';
import { Repository } from 'typeorm';
import { GetUsersFilterDto } from './helpers/get-users-filter.dto';
import { AuthService } from 'src/user-auth/auth.service';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user-dto';
import { UUID } from 'aws-sdk/clients/inspector';

//  await this.em.transaction(async em => {
//     });

@Injectable()
export class UserService {

  constructor(
      @InjectRepository(UserRepository) private userRepository: UserRepository,
      @InjectRepository(FollowsEntity) private readonly followsRepository: Repository<FollowsEntity>,
      private authService: AuthService,
    ) {}

  async signUp(createUserDto: CreateUserDto): Promise<{ name: string, id: UUID }> {
    //    relating to test cases - possible unhandledpromise rejection case?
    //    return this.userRepository.signUp(authCredentialDto).catch(err => console.error(err));
    return this.userRepository.signUp(createUserDto);
  }

  async signUpLogin(createUserDto: CreateUserDto): Promise<{ accessToken: string, user: UserEntity }> {
    await this.userRepository.signUp(createUserDto);
    return this.authService.signInWithName(createUserDto);
  }

  async getUserByName(name: string): Promise<UserEntity> {
    return this.userRepository.getUserByName( name );
  }

  async getUserById(id: string): Promise<UserEntity> {
    return this.userRepository.getUserById( id );
  }

  async getAllUsers(filterDto: GetUsersFilterDto, user: UserEntity): Promise<UserEntity[]> {
    return this.userRepository.getAllUsers(filterDto, user);
  }

  async deleteUser(id: string, currentUser: UserEntity): Promise<void> {
    const user = await this.userRepository.getUserById(id);
    if (user.id === id && ( currentUser.name.localeCompare('admin') || user.name.localeCompare(currentUser.name))) {
      const profileId = user.profile.id;
      return this.userRepository.deleteUser(id, profileId);
    } else {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async updateUserInfo(id: string, userInfoDto: UserInfoDto, currentUser: UserEntity): Promise<void> {
    if ( userInfoDto.email || userInfoDto.mobile || userInfoDto.updateUsername || userInfoDto.updatePassword ) {
      return this.userRepository.updateUserInfo(id, userInfoDto, currentUser);
    } else {
      throw new NotAcceptableException(`Update details not provided`);
    }
  }

  async checkIfUserExists(id: string): Promise<boolean> {
    return this.userRepository.checkUserId(id);
  }

  async followUser(userFollowsDto: UserFollowsDto): Promise<void> {
    const { followingId, followerId } = userFollowsDto;
    const followingUser = await this.userRepository.findOne(followingId);
    const followerUser = await this.userRepository.findOne(followerId);
    if (!followingUser || !followerUser) {
        throw new NotFoundException();
    }

    if (followingUser.id === followerUser.id) {
      throw new NotAcceptableException(`User cannot follow himself`);
    }

    const follows = await this.followsRepository.findOne( {followerId: followerUser.id, followingId: followingUser.id});
    if (!follows) {
      const toFollow = new FollowsEntity();
      toFollow.followerId = followerUser.id;
      toFollow.followingId = followingUser.id;
      await this.followsRepository.save(toFollow);
    } else {
      throw new ConflictException('User is following already');
    }
    // let profile: ProfileData = {
    //   name: followingUser.name,
    //   bio: followingUser.bio,
    //   image: followingUser.image,
    //   following: true
    // };
    // return {profile};
  }

  async unFollowUser(userFollowsDto: UserFollowsDto): Promise<void> {
    const { followingId, followerId } = userFollowsDto;

    const follows = await this.followsRepository.findOne( {followerId, followingId});

    if (follows) {
      await this.followsRepository.delete(follows.id);
    } else {
      throw new NotFoundException();
    }
    // let profile: ProfileData = {
    //   name: followingUser.name,
    //   bio: followingUser.bio,
    //   image: followingUser.image,
    //   following: false
    // };

    // return {profile};
  }
}
