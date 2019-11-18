import { Controller, Post, UseInterceptors, Param, UploadedFile, Logger,
    Body, ParseUUIDPipe, Delete, Patch, UsePipes, UploadedFiles, Query, Get, ValidationPipe } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/shared/inteceptors/multerOptions.interceptor';
import { ListingStatusValidationPipe } from 'src/shared/pipes/listingStatus-validation.pipe';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { Part } from './part.entity';
import { PartService } from './part.service';
import { CreatePartDto } from './dto/create-part.dto';

@Controller('part')
export class PartController {
    constructor(private partService: PartService) {}

    @Get()
    getParts(
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
        ): Promise<Part[]> {
        return this.partService.getParts(filterDto);
    }

    @Get('/:id')
    getPartById(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<Part> {
        return this.partService.getPartById(id);
    }

    @Get('/market/:id')
    getPartsByCategories(
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
        @Param('id', new ParseUUIDPipe()) marketId: string): Promise<Part[]> {
        return this.partService.getPartsByMarket(filterDto, marketId);
    }

    @Post('/:marketid')
    @UsePipes(ValidationPipe)
    @UseInterceptors(FilesInterceptor('images'))
    createPart(
        @Param('marketid', new ParseUUIDPipe()) marketId: string,
        @UploadedFiles() images: any,
        @Body() createPartDto: CreatePartDto,
        ): Promise<Part> {
        createPartDto.images = images;
        return this.partService.createPart(createPartDto, marketId, images);
    }

    @Delete('/:id')
    deletePart(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
        return this.partService.deletePart(id);
    }

    @Patch('/status/:id')
    updatemarketStatus(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('status', ListingStatusValidationPipe) status: ListingStatus,
        ): Promise<Part> {
            return this.partService.updatePartStatus(id, status);
    }

    @Post('/images/:id')
    @UseInterceptors(FileInterceptor('image'))
    uploadImage(@UploadedFile() image: any, @Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
        return this.partService.uploadPartImage(id, image);
    }

    @Delete('/images/:id')
    deleteCategoryImages(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<string[]> {
        return this.partService.deletePartImages(id);
    }

    @Post('/file/:dest')
    @UseInterceptors(FileInterceptor('file', multerOptions ))
        async upload(
        @Param('destination') destination: string,
        @UploadedFile() file: string): Promise<void> {
        Logger.log(file);
        const filename = Object.values(file)[1];
        this.importfiletodb('parts' + '/' + filename);
    }

    @Post('/importfiletodb')
    importfiletodb(
        @Body('filename') filename: string): Promise<void> {
        return this.partService.loadPartsFile(filename);
    }
}
