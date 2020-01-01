import { Controller, Get, Post, Body, Param, ValidationPipe, Delete,
            ParseUUIDPipe, Patch, Logger, UseGuards, Query, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { UserService } from './user.service';
import { UserInfoDto } from './dto/user-info-dto';
import { CreateUserDto } from './dto/create-user-dto';
import { UserEntity } from './entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/user-auth/decorators/get-user.decorator';
import { S3UploadService } from '../shared/services/s3Uploader/awsS3Upload.service';
import { UserFollowsDto } from './dto/user-follows-dto';
import { GetUsersFilterDto } from './helpers/get-users-filter.dto';
import { UUID } from 'aws-sdk/clients/inspector';

@Controller('user')
export class UserController {

    constructor( private usersService: UserService, private readonly s3UploadService: S3UploadService ) {}
    @UseInterceptors(ClassSerializerInterceptor)
    @Get()
    @UseGuards(AuthGuard())
    allUsers(
        @Query('page') page: number,
        @Query(ValidationPipe) filterDto: GetUsersFilterDto,
        @GetUser() user: UserEntity): Promise<UserEntity[]> {
        return this.usersService.getAllUsers(filterDto, user, page);
    }

    @Get('/creations/:id')
    @UseInterceptors(ClassSerializerInterceptor)
    getUserByIdWCreations(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<UserEntity> {
        return this.usersService.getUserByIdWCreations(id);
    }

    @Get('/:id')
    @UseInterceptors(ClassSerializerInterceptor)
    getUserById(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<UserEntity> {
        return this.usersService.getUserById(id);
    }

    @Post('/signup')
    signUp(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<{ name: string, id: UUID }> {
        return this.usersService.signUp(createUserDto);
    }

    @Post('/signuplogin')
    signUpLogin(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<{ accessToken: string, user: UserEntity }> {
        return this.usersService.signUpLogin(createUserDto);
    }

    @Post('/test')
    @UseGuards(AuthGuard())
    test(@GetUser() user: UserEntity) {
        Logger.log(user);
    }

    @Patch('/:id')
    @UseGuards(AuthGuard())
    updateUser(@Param('id', new ParseUUIDPipe()) id: string,
               @Body(ValidationPipe) userInfoDto: UserInfoDto,
               @GetUser() user: UserEntity): Promise<void> {
            return this.usersService.updateUserInfo(id, userInfoDto, user);
    }

    @Delete('/unfollow')
    @UseGuards(AuthGuard())
    unFollowUser(
        @Body(ValidationPipe) userFollowsDto: UserFollowsDto,
        @GetUser() user: UserEntity): Promise<void> {
        return this.usersService.unFollowUser(userFollowsDto);
    }

    @Delete('/:id')
    @UseGuards(AuthGuard())
    deleteUser(
        @Param('id', new ParseUUIDPipe()) id: string,
        @GetUser() user: UserEntity): Promise<void> {
        return this.usersService.deleteUser(id, user);
    }

    @Post('/follow')
    @UseGuards(AuthGuard())
    followUser(
        @Body(ValidationPipe) userFollowsDto: UserFollowsDto,
        @GetUser() user: UserEntity): Promise<void> {
        return this.usersService.followUser(userFollowsDto);
    }
}
