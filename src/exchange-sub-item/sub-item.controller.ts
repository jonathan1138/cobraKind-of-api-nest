import { Controller, Get, Query, ValidationPipe, ParseUUIDPipe, Param, Post, UsePipes, UseInterceptors,
    UploadedFiles, Body, Delete, Patch, UploadedFile, Logger, UseGuards } from '@nestjs/common';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { SubItemService } from './sub-item.service';
import { SubItem } from './sub-item.entity';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ListingStatusValidationPipe } from 'src/shared/pipes/listingStatus-validation.pipe';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { multerOptions } from 'src/shared/inteceptors/multerOptions.interceptor';
import { CreateSubItemDto } from './dto/create-sub-item-dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/user-auth/decorators/get-user.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { IpAddress } from 'src/shared/decorators/get-user-ip.decorator';

@Controller('subItem')
export class SubItemController {
    constructor(private subItemService: SubItemService) {}

    @Get()
    getSubItems(
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
        ): Promise<SubItem[]> {
        return this.subItemService.getSubItems(filterDto);
    }

    @Get('/:id')
    getSubItemById(
        @Param('id', new ParseUUIDPipe()) id: string, @IpAddress() ipAddress): Promise<SubItem> {
        // tslint:disable-next-line: max-line-length
        // const ip = (Math.floor(Math.random() * 255) + 1) + '.' + (Math.floor(Math.random() * 255) + 0) + '.' + (Math.floor(Math.random() * 255) + 0) + '.' + (Math.floor(Math.random() * 255) + 0);
        return this.subItemService.getSubItemByIdIncrementView(id, ipAddress);
    }

    @Get('/exchange/:id')
    getSubItemsByExchange(
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
        @Param('id', new ParseUUIDPipe()) exchangeId: string): Promise<SubItem[]> {
        return this.subItemService.getSubItemsByExchange(filterDto, exchangeId);
    }

    @Post('/:exchangeid')
    @UsePipes(ValidationPipe)
    @UseInterceptors(FilesInterceptor('images'))
    createSubItem(
        @Param('exchangeid', new ParseUUIDPipe()) exchangeId: string,
        @UploadedFiles() images: any,
        @Body() createSubItemDto: CreateSubItemDto,
        ): Promise<SubItem> {
        createSubItemDto.images = images;
        return this.subItemService.createSubItem(createSubItemDto, exchangeId, images);
    }

    @Delete('/:id')
    deleteSubItem(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
        return this.subItemService.deleteSubItem(id);
    }

    @Patch('/status/:id')
    updatesubItemStatus(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('status', ListingStatusValidationPipe) status: ListingStatus,
        ): Promise<SubItem> {
            return this.subItemService.updateSubItemStatus(id, status);
    }

    @Post('/images/:id')
    @UseInterceptors(FileInterceptor('image'))
    uploadImage(@UploadedFile() image: any, @Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
        return this.subItemService.uploadSubItemImage(id, image);
    }

    @Delete('/images/:id')
    deleteCategoryImages(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<string[]> {
        return this.subItemService.deleteSubItemImages(id);
    }

    @Post('/file/:dest')
    @UseInterceptors(FileInterceptor('file', multerOptions ))
        async upload(
        @Param('destination') destination: string,
        @UploadedFile() file: string): Promise<void> {
        Logger.log(file);
        const filename = Object.values(file)[1];
        this.importfiletodb('subItems' + '/' + filename);
    }

    @Post('/importfiletodb')
    importfiletodb(
        @Body('filename') filename: string): Promise<void> {
        return this.subItemService.loadSubItemsFile(filename);
    }

    @Post('/watch/:id')
    @UseGuards(AuthGuard())
    watch(@Param('id') id: string, @GetUser() user: UserEntity) {
      return this.subItemService.watchSubItem(id, user.id);
    }

    @Post('/unwatch/:id')
    @UseGuards(AuthGuard())
    unwatch(@Param('id') id: string, @GetUser() user: UserEntity) {
      return this.subItemService.unWatchSubItem(id, user.id);
    }

    // @Post('/upvote/:id')
    // @UseGuards(AuthGuard())
    // upvote(@Param('id') id: string, @GetUser() user: UserEntity) {
    //   return this.subItemService.upvote(id, user.id);
    // }

    // @Post('/downvote/:id')
    // @UseGuards(AuthGuard())
    // downvote(@Param('id') id: string, @GetUser() user: UserEntity) {
    //   return this.subItemService.downvote(id, user.id);
    // }
}
