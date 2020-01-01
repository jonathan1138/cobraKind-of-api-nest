import { Controller, Post, Body, Param, UseGuards, UseInterceptors, UploadedFile, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/shared/inteceptors/multerOptions.interceptor';
import { FileReaderService } from './fileReader.service';

@Controller('filereader')
export class FileReaderController {
    constructor(private fileReaderService: FileReaderService) {}

    @Post('/category/:dest')
    @UseGuards(AuthGuard())
    @UseInterceptors(FileInterceptor('file', multerOptions ))
        async uploadCategory(
        @Param('destination') destination: string,
        @UploadedFile() file: string): Promise<void> {
        Logger.log(file);
        const filename = Object.values(file)[1];
        this.importcategoryfiletodb('categories' + '/' + filename);
    }

    @Post('/category/importfiletodb')
    @UseGuards(AuthGuard())
    importcategoryfiletodb(
        @Body('filename') filename: string): Promise<void> {
        return this.fileReaderService.importCategoryFileToDb(filename);
    }

    @Post('/market/:dest')
    @UseGuards(AuthGuard())
    @UseInterceptors(FileInterceptor('file', multerOptions ))
        async uploadMarket(
        @Param('destination') destination: string,
        @UploadedFile() file: string): Promise<void> {
        Logger.log(file);
        const filename = Object.values(file)[1];
        this.importmarketfiletodb('markets' + '/' + filename);
    }

    @Post('/market/importfiletodb')
    @UseGuards(AuthGuard())
    importmarketfiletodb(
        @Body('filename') filename: string): Promise<void> {
        return this.fileReaderService.importMarketFileToDb(filename);
    }

    @Post('/tag/:dest')
    @UseGuards(AuthGuard())
    @UseInterceptors(FileInterceptor('file', multerOptions ))
        async uploadTag(
        @Param('destination') destination: string,
        @UploadedFile() file: string): Promise<void> {
        Logger.log(file);
        const filename = Object.values(file)[1];
        this.importtagfiletodb('tags' + '/' + filename);
    }

    @Post('/tag/importfiletodb')
    @UseGuards(AuthGuard())
    importtagfiletodb(
        @Body('filename') filename: string): Promise<void> {
        return this.fileReaderService.importTagFileToDb(filename);
    }
}
