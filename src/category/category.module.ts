import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryRepository } from './category.repository';
import { AuthModule } from '../user-auth/auth.module';
import { S3UploadService } from '../shared/services/s3Uploader/awsS3Upload.service';
@Module({
  imports: [TypeOrmModule.forFeature([CategoryRepository]), AuthModule ],
  controllers: [CategoryController],
  providers: [CategoryService, S3UploadService],
})
export class CategoryModule {}
