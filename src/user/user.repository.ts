import { Repository, EntityRepository, EntityManager } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { AuthCredentialsDto } from '../user-auth/dto/auth-credentials.dto';
import { ConflictException, InternalServerErrorException, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserInfoDto } from './dto/user-info-dto';
import { UserExistsQuery } from './helpers/userExistsQuery.helpers';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Profile } from 'src/user-profile/profile.entity';
import { UserRole } from './entities/user-role.entity';
import { Role } from '../shared/enums/role.enum';
import { UUID } from 'aws-sdk/clients/inspector';
import { GetUsersFilterDto } from './helpers/get-users-filter.dto';
import { CreateUserDto } from './dto/create-user-dto';

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
    private logger = new Logger('UserRepository');

    constructor(
        @InjectEntityManager() private readonly em: EntityManager,
      ) {
        super();
    }

    jwtService: any;

    async signUp(createUserDto: CreateUserDto): Promise< {name: string, id: UUID}> {
        const { name, password } = createUserDto;
        const salt = await bcrypt.genSalt();
        const user = this.create();
        const profile = new Profile();
        const role = new UserRole();
        user.name = name;
        user.password = await this.hashPassword(password, salt);

        user.profile = profile;
        user.listingRatings = [];
        user.posts = [];
        profile.bio = null;
        profile.interests = null;
        profile.profilePhoto = null;

        user.role = role;
        if (   name.localeCompare('admin') === 0 ) {
            user.role.name = Role.ADMIN;
        } else {
            user.role.name = Role.USER;
        }
        user.role = role;

        try {
            const result = await user.save();
            return { name, id: result.id };
        } catch (error) {
            if (error.code === '23505') { // duplicate user name
                throw new ConflictException('Username already exists');
            } else {
                throw new InternalServerErrorException('Failed to save user. Check with administrator');
            }
        }
    }

    async getAllUsers(filterDto: GetUsersFilterDto, user: UserEntity, page: number = 1): Promise<UserEntity[]> {
        const isAdmin = await this.validateAdminUser(user);
        if (!isAdmin) {
            throw new UnauthorizedException('Invalid Credentials: not an administator');
        }
        const { search } = filterDto;
        const query = this.createQueryBuilder('user_entity');
        if (search) {
            query.where('(user_entity.name LIKE :search)', { search: `%${search}%` });
        }
        query.leftJoinAndSelect('user_entity.profile', 'profile');
        query.leftJoinAndSelect('profile.watchedTags', 'tag');
        query.leftJoinAndSelect('profile.watchedMarkets', 'market');
        query.leftJoinAndSelect('profile.watchedExchanges', 'exchange');
        query.leftJoinAndSelect('user_entity.listingRatings', 'listingRating');
        query.leftJoinAndSelect('user_entity.posts', 'posts');
        if (page > 0) {
            query.take(15);
            query.skip(15 * (page - 1));
        }
        query.orderBy('user_entity.name', 'ASC');
        try {
            const users = await query.getMany();
            return users;
        } catch (error) {
            this.logger.error(`Failed to get users`, error.stack);
            throw new InternalServerErrorException('Failed to get users');
        }
    }

    async getUserByName( name: string ): Promise<UserEntity> {
        const found = await this.findOne({name}, { relations: [
            'listingRatings', 'profile', 'profile.watchedTags',
            'profile.watchedMarkets', 'profile.watchedExchanges'] });
        return found;
    }

    async getUserById(id: string): Promise<UserEntity> {
        const found = await this.findOne(id, { relations: ['listingRatings',
            'profile', 'profile.watchedTags', 'profile.watchedMarkets', 'profile.watchedExchanges'] });
        if (!found) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return found;
    }

    async getUserByIdWCreations(id: string): Promise<UserEntity> {
        const found = await this.findOne(id, { relations: ['listingRatings',
            'profile', 'profile.createdTags', 'profile.createdMarkets', 'profile.createdExchanges'] });
        if (!found) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return found;
    }

    async checkIfUserExists( name: string, password: string ): Promise<boolean> {
        const query: UserExistsQuery = new UserExistsQuery( name, password );
        const result: any = await this.findOne( query );
        return result ? true : false;
    }

    async checkUserId(id: string): Promise<boolean> {
        const result = await this.findOne(id);
        if (!result) {
            throw new NotFoundException();
        } else { return true; }
    }

    async updateUserInfo(id: string, userInfoDto: UserInfoDto, currentUser ): Promise<void> {
        const user = await this.validateByNameAndReturn(id, currentUser);
        if (!user) {
            throw new UnauthorizedException('Must be logged in user or admin');
        }
        const { email, mobile, updateUsername, updatePassword, bio, interests } = userInfoDto;
        user.mobile = mobile;
        user.email = email;
        user.profile.bio = bio;
        user.profile.interests = interests;

        if (updateUsername) {
            user.name = updateUsername;
        }
        if (updatePassword) {
            user.password = updatePassword;
        }
        try {
            await user.save();
         } catch (error) {
            throw new InternalServerErrorException('Failed to update user. Check with administrator');
        }
    }

    async updateProfilePhoto(id: string, s3ImgUrl: string): Promise<void> {
        const user = await this.findOne({ id }, { relations: ['profile'] });
        user.profile.profilePhoto = s3ImgUrl;
        await user.save();
    }

    async deleteUser(id: string, profileId: string): Promise<void> {
        await this.em.transaction(async em => {
            em.delete(UserEntity, id);
            em.delete(Profile, profileId);
        });
    }

    async validateUserPasswordByName(authCredentialsDto: AuthCredentialsDto): Promise<string> {
        const { name, password } = authCredentialsDto;
        const user = await this.findOne({ name });
        if (user && await user.validatePassword(password)) {
            return user.name;
        } else {
            return null;
        }
    }

    async validateByNameAndReturn(id: string, currentUser: UserEntity): Promise<UserEntity> {
        const user = await this.findOne({ id }, { relations: ['profile'] });
        if (currentUser.name.localeCompare('admin') || user.name.localeCompare(currentUser.name)) {
            return user;
        } else {
            return null;
        }
    }

    private async validateAdminUser(user: UserEntity): Promise<boolean> {
        const { name, password } = user;
        const found = await this.findOne({ name }, {relations: ['role']});

        if (!found) {
            throw new UnauthorizedException('Invalid Credentials for all users: name or password');
        }

        if ( (name.localeCompare('admin') === 0) ) {
            return true;
        } else {
             return false;
        }
    }

    private async hashPassword(password: string, salt: string): Promise<string> {
        return bcrypt.hash(password, salt);
    }
}
