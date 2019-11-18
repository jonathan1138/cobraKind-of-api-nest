import { Controller, Delete, Param, ParseUUIDPipe, Post,
    UseInterceptors, UploadedFile, ValidationPipe, Query, Get, UsePipes, UploadedFiles,
    Body, Patch, UseGuards, ClassSerializerInterceptor } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
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

// @UseGuards(AuthGuard())
@Controller('post')
export class PostController {

    constructor(private postService: PostService) {}
    @UseInterceptors(ClassSerializerInterceptor)
    @Get()
    getPosts(
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
        ): Promise<PostEntity[]> {
        return this.postService.getPosts(filterDto);
    }

    @Get('/:id')
    getPostById(
        @Param('id', new ParseUUIDPipe()) id: string, @IpAddress() ipAddress): Promise<PostEntity> {
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

    @Post('/:exchangeid')
    @UseGuards(AuthGuard())
    @UsePipes(ValidationPipe)
    @UseInterceptors(FilesInterceptor('images'))
    createPost(
        @Param('exchangeid', new ParseUUIDPipe()) exchangeId: string,
        @UploadedFiles() images: any,
        @Body() createPostDto: CreatePostDto,
        @GetUser() user: UserEntity,
        ): Promise<PostEntity> {
        createPostDto.images = images;
        return this.postService.createPost(createPostDto, exchangeId, user, images);
    }

    @Delete('/:id')
    deletePost(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
        return this.postService.deletePost(id);
    }

    @Patch('/status/:id')
    updateexchangeStatus(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('status', ListingStatusValidationPipe) status: ListingStatus,
        ): Promise<PostEntity> {
            return this.postService.updatePostStatus(id, status);
    }

    @Post('/images/:id')
    @UseInterceptors(FileInterceptor('image'))
    uploadImage(@UploadedFile() image: any, @Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
        return this.postService.uploadPostImage(id, image);
    }

    @Post('/watch/:id')
    @UseGuards(AuthGuard())
    watch(@Param('id') id: string, @GetUser() user: UserEntity) {
      return this.postService.watchPost(id, user.id);
    }

    @Post('/unwatch/:id')
    @UseGuards(AuthGuard())
    unwatch(@Param('id') id: string, @GetUser() user: UserEntity) {
      return this.postService.unWatchPost(id, user.id);
    }

    @Delete('/images/:id')
    deleteCategoryImages(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<string[]> {
        return this.postService.deletePostImages(id);
    }
}
