import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../user/user.repository';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt/jwt.strategy';
import * as config from 'config';

const jwtConfig = config.get('JWT.EXPIRES_IN');
const jwtSecret = process.env.JWT_SECRET || config.get('JWT.SECRET');

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtSecret,
      signOptions: {
        expiresIn: jwtConfig,
      },
    }),
    TypeOrmModule.forFeature([UserRepository]),
  ],
  controllers: [AuthController],
  providers: [ AuthService, JwtStrategy ],
  exports: [
    JwtStrategy,
    PassportModule,
    AuthService,
  ],
})
export class AuthModule {}
