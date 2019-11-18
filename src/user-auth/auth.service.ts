import { Injectable, UnauthorizedException, Logger, NotAcceptableException } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ExtractJwt } from 'passport-jwt';
import * as config from 'config';

@Injectable()
export class AuthService {
    private logger = new Logger('AuthService');
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        private jwtService: JwtService,
    ) {}

    async signInWithName(authCredentialDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
        const name = await this.userRepository.validateUserPasswordByName(authCredentialDto);
        if (!name) {
            throw new UnauthorizedException('Invalid Credentials');
        }
        const payload: JwtPayload = { name };
        const accessToken = await this.jwtService.sign(payload);
        this.logger.debug(`Generated JWT Token with payload ${JSON.stringify(payload)}`);
        return { accessToken };
    }
}
