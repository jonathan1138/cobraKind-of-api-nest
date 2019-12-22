import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { TagRepository } from './tag.repository';
import { CategoryRepository } from '../category/category.repository';
import { AuthModule } from 'src/user-auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([TagRepository, CategoryRepository]), AuthModule ],
  controllers: [TagController],
  providers: [TagService],
})
export class TagModule {}
