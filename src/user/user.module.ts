import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { AuthModule } from 'src/user-auth/auth.module';
import { S3UploadService } from 'src/shared/services/s3Uploader/awsS3Upload.service';
import { FollowsEntity } from './entities/follows.entity';

@Module({
    imports: [ TypeOrmModule.forFeature([UserRepository, FollowsEntity]), AuthModule ],
    controllers: [UserController],
    providers: [UserService, S3UploadService],
})
export class UserModule {}
