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
        @UploadedFile() file: string): Promise<string> {
        const filename = Object.values(file)[1];
        return await this.importmarketfiletodb('markets' + '/' + filename);
    }

    @Post('/market/importfiletodb')
    @UseGuards(AuthGuard())
    async importmarketfiletodb(
        @Body('filename') filename: string): Promise<string> {
        return await this.fileReaderService.importMarketFileToDb(filename);
    }

    @Post('/tag/:dest')
    @UseGuards(AuthGuard())
    @UseInterceptors(FileInterceptor('file', multerOptions ))
    async uploadTag(
        @Param('destination') destination: string,
        @UploadedFile() file: string): Promise<string>  {
        const filename = Object.values(file)[1];
        return await this.importtagfiletodb('tags' + '/' + filename);
    }

    @Post('/tag/importfiletodb')
    @UseGuards(AuthGuard())
    async importtagfiletodb(
        @Body('filename') filename: string): Promise<string>  {
        return await this.fileReaderService.importTagFileToDb(filename);
    }

    @Post('/exchange/:dest')
    @UseGuards(AuthGuard())
    @UseInterceptors(FileInterceptor('file', multerOptions ))
    async uploadExchange(
        @Param('destination') destination: string,
        @UploadedFile() file: string): Promise<string> {
        const filename = Object.values(file)[1];
        return await this.importexchangefiletodb('exchanges' + '/' + filename);
    }

    @Post('/exchange/importfiletodb')
    @UseGuards(AuthGuard())
    async importexchangefiletodb(
        @Body('filename') filename: string): Promise<string> {
        return await this.fileReaderService.importExchangeFileToDb(filename);
    }

    @Post('/part/:dest')
    @UseGuards(AuthGuard())
    @UseInterceptors(FileInterceptor('file', multerOptions ))
    async uploadPart(
        @Param('destination') destination: string,
        @UploadedFile() file: string): Promise<string> {
        const filename = Object.values(file)[1];
        return await this.importpartfiletodb('parts' + '/' + filename);
    }

    @Post('/part/importfiletodb')
    @UseGuards(AuthGuard())
    async importpartfiletodb(
        @Body('filename') filename: string): Promise<string> {
        return await this.fileReaderService.importPartFileToDb(filename);
    }
}
