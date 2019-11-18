import { Controller, Post, Body,
        ValidationPipe, UseGuards, Logger, Get, Param} from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { UserEntity } from '../user/entities/user.entity';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
    ) {}

    @Get('/validateToken')
    @UseGuards(AuthGuard())
    ValidateUser(@GetUser() user: UserEntity) {
        return user;
    }

    @Post('/signin')
    signIn(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto): Promise<{accessToken: string}> {
        return this.authService.signInWithName(authCredentialsDto);
    }

    @Post('/test')
    @UseGuards(AuthGuard())
    test(@GetUser() user: UserEntity) {
        Logger.log(user);
    }
}
