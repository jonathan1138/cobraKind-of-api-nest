import { Controller, Delete, Param, ParseUUIDPipe, Post,
    UseInterceptors, ValidationPipe, Query, Get, UsePipes, UploadedFiles,
    Body, Patch, UseGuards, ClassSerializerInterceptor } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { PostService } from './post.service';
import { PostEntity } from './post.entity';
import { CreatePostDto } from './dto/create-post-dto';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { ListingStatusValidationPipe } from 'src/shared/pipes/listingStatus-validation.pipe';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/user-auth/decorators/get-user.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { IpAddress } from 'src/shared/decorators/get-user-ip.decorator';
import { DeletePostDto } from './dto/delete-post-dto';

// @UseGuards(AuthGuard())
@Controller('post')
export class PostController {

    constructor(private postService: PostService) {}
    @UseInterceptors(ClassSerializerInterceptor)
    @Get()
    getPosts(
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
        @Query('page') page: number,
        ): Promise<PostEntity[]> {
        return this.postService.getPosts(filterDto, page);
    }

    @Get('/:id')
    getPostById(
        @Param('id', new ParseUUIDPipe()) id: string, @IpAddress() ipAddress): Promise<PostEntity> {
        // tslint:disable-next-line: max-line-length
        // const ip = (Math.floor(Math.random() * 255) + 1) + '.' + (Math.floor(Math.random() * 255) + 0) + '.' + (Math.floor(Math.random() * 255) + 0) + '.' + (Math.floor(Math.random() * 255) + 0);
        return this.postService.getPostByIdIncrementView(id, ipAddress);
    }

    @Get('/view/:id')
    getPostByIdView(
        @Param('id', new ParseUUIDPipe()) id: string, @IpAddress() ipAddress ): Promise<PostEntity> {
        // tslint:disable-next-line: max-line-length
        // const ip = (Math.floor(Math.random() * 255) + 1) + '.' + (Math.floor(Math.random() * 255) + 0) + '.' + (Math.floor(Math.random() * 255) + 0) + '.' + (Math.floor(Math.random() * 255) + 0);
        return this.postService.getPostByIdIncrementView(id, ipAddress);
    }

    @Get('/exchange/:id')
    getPostsByExchange(
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
        @Param('id', new ParseUUIDPipe()) id: string): Promise<PostEntity[]> {
            return this.postService.getPostsByExchange(filterDto, id);
    }

    @Post('/:id')
    @UseGuards(AuthGuard())
    @UsePipes(ValidationPipe)
    @UseInterceptors(FilesInterceptor('images'))
    createPost(
        @Param('id', new ParseUUIDPipe()) id: string,
        @UploadedFiles() images: any,
        @Body() createPostDto: CreatePostDto,
        @GetUser() user: UserEntity,
        ): Promise<PostEntity> {
        createPostDto.images = images;
        return this.postService.createPost(createPostDto, id, user, images);
    }

    @Delete()
    @UseGuards(AuthGuard())
    deletePosts(
        @Body(ValidationPipe) deletePostDto: DeletePostDto ): Promise<void> {
        return this.postService.deletePost(deletePostDto);
    }

    @Patch('/status/:id')
    @UseGuards(AuthGuard())
    updatePostStatus(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('status', ListingStatusValidationPipe) status: ListingStatus,
        @Body('statusnote') statusNote?: string,
        ): Promise<PostEntity> {
            return this.postService.updatePostStatus(id, status, statusNote);
    }

    @Patch('/update/:id')
    @UseGuards(AuthGuard())
    updatePost(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() createPostDto: CreatePostDto,
        ): Promise<void> {
            return this.postService.updatePost(id, createPostDto);
    }

    @Patch('/watchedposts/:id')
    @UseGuards(AuthGuard())
    async updateWatchedPosts(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('posts') posts: string[],
        ): Promise<UserEntity> {
            return await this.postService.updateWatchedPosts(id, posts);
    }

    @Post('/images/:id')
    @UseGuards(AuthGuard())
    @UseInterceptors(FilesInterceptor('image'))
    uploadImages(@UploadedFiles() images: any, @Param('id', new ParseUUIDPipe()) id: string): Promise<string[]> {
        return this.postService.uploadPostImages(id, images);
    }

    @Post('/watch/:id')
    @UseGuards(AuthGuard())
    async watch(@Param('id') id: string, @GetUser() user: UserEntity): Promise<PostEntity> {
      return await this.postService.watchPost(id, user.id);
    }

    @Post('/unwatch/:id')
    @UseGuards(AuthGuard())
    async unwatch(@Param('id') id: string, @GetUser() user: UserEntity): Promise<PostEntity> {
      return await this.postService.unWatchPost(id, user.id);
    }

    @Delete('/images/:id')
    @UseGuards(AuthGuard())
    deletePostImages(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<string[]> {
        return this.postService.deletePostImages(id);
    }
}
