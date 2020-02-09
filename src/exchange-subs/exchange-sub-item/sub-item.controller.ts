import { Controller, Get, Query, ValidationPipe, ParseUUIDPipe, Param, Post, UsePipes, UseInterceptors,
    UploadedFiles, Body, Delete, Patch, UploadedFile, Logger, UseGuards } from '@nestjs/common';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { SubItemService } from './sub-item.service';
import { SubItem } from './sub-item.entity';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ListingStatusValidationPipe } from 'src/shared/pipes/listingStatus-validation.pipe';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
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
        @Query('page') page: number,
        ): Promise<SubItem[]> {
        return this.subItemService.getSubItems(filterDto, page);
    }

    @Get('/:id')
    getSubItemById(
        @Param('id', new ParseUUIDPipe()) id: string, @IpAddress() ipAddress): Promise<SubItem> {
        // tslint:disable-next-line: max-line-length
        // const ip = (Math.floor(Math.random() * 255) + 1) + '.' + (Math.floor(Math.random() * 255) + 0) + '.' + (Math.floor(Math.random() * 255) + 0) + '.' + (Math.floor(Math.random() * 255) + 0);
        return this.subItemService.getSubItemByIdIncrementView(id, ipAddress);
    }

    @Get('/view/:id')
    getExchangeByIdView(
        @Param('id', new ParseUUIDPipe()) id: string, @IpAddress() ipAddress ): Promise<SubItem> {
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
    @UseGuards(AuthGuard())
    @UseInterceptors(FilesInterceptor('images'))
    createSubItem(
        @Param('exchangeid', new ParseUUIDPipe()) exchangeId: string,
        @UploadedFiles() images: any,
        @GetUser() user: UserEntity,
        @Body() createSubItemDto: CreateSubItemDto,
        ): Promise<SubItem> {
        createSubItemDto.images = images;
        return this.subItemService.createSubItem(createSubItemDto, exchangeId, user.id, images);
    }

    @Delete('/:id')
    @UseGuards(AuthGuard())
    deleteSubItem(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
        return this.subItemService.deleteSubItem(id);
    }

    @Patch('/status/:id')
    @UseGuards(AuthGuard())
    updatesubItemStatus(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('status', ListingStatusValidationPipe) status: ListingStatus,
        @Body('statusnote') statusNote?: string,
        ): Promise<SubItem> {
            return this.subItemService.updateSubItemStatus(id, status, statusNote);
    }

    @Post('/images/:id')
    @UseGuards(AuthGuard())
    @UseInterceptors(FilesInterceptor('image'))
    uploadImages(@UploadedFiles() images: any, @Param('id', new ParseUUIDPipe()) id: string): Promise<string[]> {
        return this.subItemService.uploadSubItemImages(id, images);
    }

    @Delete('/images/:id')
    @UseGuards(AuthGuard())
    deleteSubItemImages(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<string[]> {
        return this.subItemService.deleteSubItemImages(id);
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

    @Patch('/vote/:id')
    @UseGuards(AuthGuard())
    updateVote(
        @Param('id', new ParseUUIDPipe()) id: string, @GetUser() user: UserEntity,
        ): Promise<SubItem> {
            return this.subItemService.updateVote(user.id, id);
    }

    @Patch('/update/:id')
    @UseGuards(AuthGuard())
    updateSubItem(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() createSubItemDto: CreateSubItemDto,
        ): Promise<void> {
            return this.subItemService.updateSubItem(id, createSubItemDto);
    }
}
