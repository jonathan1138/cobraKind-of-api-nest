import { Controller, Post, UseInterceptors, Param, UploadedFile, Logger,
    Body, ParseUUIDPipe, Delete, Patch, UsePipes, UploadedFiles, Query, Get, ValidationPipe, UseGuards } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ListingStatusValidationPipe } from 'src/shared/pipes/listingStatus-validation.pipe';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { Part } from './part.entity';
import { PartService } from './part.service';
import { CreatePartDto } from './dto/create-part.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/user-auth/decorators/get-user.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { Exchange } from 'src/market-exchange/exchange.entity';
import { IpAddress } from 'src/shared/decorators/get-user-ip.decorator';

@Controller('part')
export class PartController {
    constructor(private partService: PartService) {}

    @Get()
    getParts(
        @Query('page') page: number,
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
        ): Promise<Part[]> {
        return this.partService.getParts(filterDto, page);
    }

    @Get('/:id')
    getPartById(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<Part> {
        return this.partService.getPartById(id);
    }

    @Get('/view/:id')
    getPartByIdView(
        @Param('id', new ParseUUIDPipe()) id: string, @IpAddress() ipAddress ): Promise<Part> {
        // tslint:disable-next-line: max-line-length
        // const ip = (Math.floor(Math.random() * 255) + 1) + '.' + (Math.floor(Math.random() * 255) + 0) + '.' + (Math.floor(Math.random() * 255) + 0) + '.' + (Math.floor(Math.random() * 255) + 0);
        return this.partService.getPartByIdIncrementView(id, ipAddress);
    }

    @Get('/market/:id')
    getPartsByCategories(
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
        @Param('id', new ParseUUIDPipe()) marketId: string): Promise<Part[]> {
        return this.partService.getPartsByMarket(filterDto, marketId);
    }

    @Post('/:marketid')
    @UseGuards(AuthGuard())
    @UsePipes(ValidationPipe)
    @UseInterceptors(FilesInterceptor('images'))
    createPart(
        @Param('marketid', new ParseUUIDPipe()) marketId: string,
        @UploadedFiles() images: any,
        @Body() createPartDto: CreatePartDto,
        @GetUser() user: UserEntity,
        ): Promise<Part> {
        createPartDto.images = images;
        return this.partService.createPart(createPartDto, marketId, user.id, images);
    }

    @Delete('/:id')
    @UseGuards(AuthGuard())
    deletePart(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
        return this.partService.deletePart(id);
    }

    @Patch('/status/:id')
    @UseGuards(AuthGuard())
    updatePartStatus(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('status', ListingStatusValidationPipe) status: ListingStatus,
        @Body('statusnote') statusNote?: string,
        ): Promise<Part> {
            return this.partService.updatePartStatus(id, status, statusNote);
    }

    @Patch('/update/:id')
    @UseGuards(AuthGuard())
    updatePart(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() createPartDto: CreatePartDto,
        ): Promise<void> {
            return this.partService.updatePart(id, createPartDto);
    }

    @Patch('/exchange/:id')
    @UseGuards(AuthGuard())
    updatePartExchanges(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('exchanges') exchanges: Exchange[],
        ): Promise<Part> {
            return this.partService.updatePartExchanges(id, exchanges);
    }

    @Post('/images/:id')
    @UseGuards(AuthGuard())
    @UseInterceptors(FilesInterceptor('image'))
    uploadImage(@UploadedFiles() images: any, @Param('id', new ParseUUIDPipe()) id: string): Promise<string[]> {
        return this.partService.uploadPartImages(id, images);
    }

    @Post('/watch/:id')
    @UseGuards(AuthGuard())
    watch(@Param('id') id: string, @GetUser() user: UserEntity): Promise<Part>  {
      return this.partService.watchPart(id, user.id);
    }

    @Post('/unwatch/:id')
    @UseGuards(AuthGuard())
    unwatch(@Param('id') id: string, @GetUser() user: UserEntity): Promise<Part>  {
      return this.partService.unWatchPart(id, user.id);
    }

    @Patch('/vote/:id')
    @UseGuards(AuthGuard())
    updateVote(
        @Param('id', new ParseUUIDPipe()) id: string, @GetUser() user: UserEntity,
        ): Promise<Part> {
            return this.partService.updateVote(user.id, id);
    }

    @Delete('/images/:id')
    @UseGuards(AuthGuard())
    deletePartImages(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<string[]> {
        return this.partService.deletePartImages(id);
    }
}
