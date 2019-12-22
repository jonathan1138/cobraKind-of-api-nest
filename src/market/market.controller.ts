import { Controller, Get, Post, Body, Param, Delete,
            Patch, Query, UsePipes, ValidationPipe, UseGuards,
            ParseUUIDPipe, UseInterceptors, UploadedFile, UploadedFiles, Logger } from '@nestjs/common';
import { MarketService } from './market.service';
import { CreateMarketDto } from './dto/create-market-dto';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { ListingStatusValidationPipe } from '../shared/pipes/listingStatus-validation.pipe';
import { Market } from './market.entity';
import { ListingStatus } from '../shared/enums/listing-status.enum';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/shared/inteceptors/multerOptions.interceptor';
import { GetUser } from 'src/user-auth/decorators/get-user.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { IpAddress } from 'src/shared/decorators/get-user-ip.decorator';

@Controller('market')
// @UseGuards(AuthGuard())
export class MarketController {
    constructor(private marketService: MarketService) {}

    @Get()
    getMarkets(
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
        ): Promise<Market[]> {
        return this.marketService.getMarkets(filterDto);
    }

    @Get('/tag')
    getWithTags(
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto): Promise<Market[]> {
            return this.marketService.getTags(filterDto);
    }

    @Get('/:id')
    getMarketById(
        @Param('id', new ParseUUIDPipe()) id: string, @IpAddress() ipAddress): Promise<Market> {
        return this.marketService.getMarketByIdIncrementView(id, ipAddress);
    }

    @Get('/category/:id')
    getMarketsByCategories(
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
        @Param('id', new ParseUUIDPipe()) categoryId: string): Promise<Market[]> {
        return this.marketService.getMarketsByCategory(filterDto, categoryId);
    }

    @Get('/exchange/:id')
    getExchangesForMarket(
        @Param('id', new ParseUUIDPipe()) marketId: string): Promise<Market> {
        return this.marketService.getExchangesForMarket(marketId);
    }

    @Get('/part/:id')
    getPartsForMarket(
        @Param('id', new ParseUUIDPipe()) marketId: string): Promise<Market> {
        return this.marketService.getPartsForMarket(marketId);
    }

    @Get('/exchangeandparts/:id')
    getExchangeAndPartsForMarket(
        @Param('id', new ParseUUIDPipe()) marketId: string): Promise<Market> {
        return this.marketService.getExchangesAndPartsForMarket(marketId);
    }

    @Get('/tag/:id')
    getMarketsWithTagsByCat(
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
        @Param('id', new ParseUUIDPipe()) id: string): Promise<Market[]> {
            return this.marketService.getTagsByCatId(id, filterDto);
    }

    @Post('/:categoryid')
    @UsePipes(ValidationPipe)
    @UseInterceptors(FilesInterceptor('images'))
    createMarket(
        @Param('categoryid', new ParseUUIDPipe()) categoryId: string,
        @UploadedFiles() images: any,
        @Body() createMarketDto: CreateMarketDto,
        ): Promise<Market> {
        createMarketDto.images = images;
        return this.marketService.createMarket(createMarketDto, categoryId, images);
    }

    @Delete('/:id')
    deleteMarket(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
        return this.marketService.deleteMarket(id);
    }

    @Patch('/status/:id')
    updatemarketStatus(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('status', ListingStatusValidationPipe) status: ListingStatus,
        ): Promise<Market> {
            return this.marketService.updateMarketStatus(id, status);
    }

    @Patch('/tag/:id')
    updateMarketTags(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('tags') tags: string[],
        ): Promise<Market> {
            return this.marketService.updateMarketTags(id, tags);
    }

    @Post('/images/:id')
    @UseInterceptors(FileInterceptor('image'))
    uploadImage(@UploadedFile() image: any, @Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
        return this.marketService.uploadMarketImage(id, image);
    }

    @Post('/file/:dest')
    @UseInterceptors(FileInterceptor('file', multerOptions ))
        async upload(
        @Param('destination') destination: string,
        @UploadedFile() file: string): Promise<void> {
        Logger.log(file);
        const filename = Object.values(file)[1];
        this.importfiletodb('markets' + '/' + filename);
    }

    @Post('/importfiletodb')
    importfiletodb(
        @Body('filename') filename: string): Promise<void> {
        return this.marketService.loadMarketsFile(filename);
    }

    @Post('/watch/:id')
    @UseGuards(AuthGuard())
    watch(@Param('id') id: string, @GetUser() user: UserEntity) {
      return this.marketService.watchMarket(id, user.id);
    }

    @Post('/unwatch/:id')
    @UseGuards(AuthGuard())
    unwatch(@Param('id') id: string, @GetUser() user: UserEntity) {
      return this.marketService.unWatchMarket(id, user.id);
    }

    @Delete('/images/:id')
    deleteCategoryImages(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<string[]> {
        return this.marketService.deleteMarketImages(id);
    }
}
