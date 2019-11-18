import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../user/user.repository';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import * as config from 'config';

const jwtSecret = process.env.JWT_SECRET || config.get('JWT.SECRET');

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtSecret,
        });
    }

    async validate(payload: JwtPayload): Promise<UserEntity> {
        const { name } = payload;
        const user = await this.userRepository.findOne({name});
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
