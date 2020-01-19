import { Controller, Get, Post, Body, Param, Delete,
            Patch, Query, UsePipes, ValidationPipe, UseGuards,
            ParseUUIDPipe, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { MarketService } from './market.service';
import { CreateMarketDto } from './dto/create-market-dto';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { ListingStatusValidationPipe } from '../shared/pipes/listingStatus-validation.pipe';
import { Market } from './market.entity';
import { ListingStatus } from '../shared/enums/listing-status.enum';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { GetUser } from 'src/user-auth/decorators/get-user.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { IpAddress } from 'src/shared/decorators/get-user-ip.decorator';

@Controller('market')
// @UseGuards(AuthGuard())
export class MarketController {
    constructor(private marketService: MarketService) {}

    @Get()
    getMarkets(
        @Query('page') page: number,
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
        ): Promise<Market[]> {
        return this.marketService.getMarkets(filterDto, page);
    }

    @Get('/tag')
    getWithTags(
        @Query('page') page: number,
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto): Promise<Market[]> {
            return this.marketService.getTags(filterDto, page);
    }

    @Get('/:id')
    getMarketById(
        @Param('id', new ParseUUIDPipe()) id: string, @IpAddress() ipAddress): Promise<Market> {
        return this.marketService.getMarketByIdIncrementView(id, ipAddress);
    }

    @Get('/category/:id')
    getMarketsByCategories(
        @Query('page') page: number,
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
        @Param('id', new ParseUUIDPipe()) categoryId: string): Promise<Market[]> {
        return this.marketService.getMarketsByCategory(filterDto, categoryId, page);
    }

    @Get('/exchange/:id')
    getExchangesForMarket(
        @Param('id', new ParseUUIDPipe()) marketId: string): Promise<Market> {
        return this.marketService.getExchangeForMarket(marketId);
    }

    @Get('/part/:id')
    getPartsForMarket(
        @Param('id', new ParseUUIDPipe()) marketId: string): Promise<Market> {
        return this.marketService.getPartForMarket(marketId);
    }

    @Get('/exchangeandparts/:id')
    getExchangeAndPartsForMarket(
        @Param('id', new ParseUUIDPipe()) marketId: string): Promise<Market> {
        return this.marketService.getExchangeAndPartForMarket(marketId);
    }

    @Get('/tag/:id')
    getMarketsWithTagsByCat(
        @Query('page') page: number,
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
        @Param('id', new ParseUUIDPipe()) id: string): Promise<Market[]> {
            return this.marketService.getTagsByCatId(id, filterDto, page);
    }

    @Get('/view/:id')
    getMarketByIdView(
        @Param('id', new ParseUUIDPipe()) id: string, @IpAddress() ipAddress ): Promise<Market> {
        // tslint:disable-next-line: max-line-length
        // const ip = (Math.floor(Math.random() * 255) + 1) + '.' + (Math.floor(Math.random() * 255) + 0) + '.' + (Math.floor(Math.random() * 255) + 0) + '.' + (Math.floor(Math.random() * 255) + 0);
        return this.marketService.getMarketByIdIncrementView(id, ipAddress);
    }

    @Post('/:categoryid')
    @UsePipes(ValidationPipe)
    @UseGuards(AuthGuard())
    @UseInterceptors(FilesInterceptor('images'))
    createMarket(
        @Param('categoryid', new ParseUUIDPipe()) categoryId: string,
        @UploadedFiles() images: any,
        @Body() createMarketDto: CreateMarketDto,
        @GetUser() user: UserEntity,
        ): Promise<Market> {
        createMarketDto.images = images;
        return this.marketService.createMarket(createMarketDto, categoryId, user.id, images);
    }

    @Delete('/:id')
    @UseGuards(AuthGuard())
    deleteMarket(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
        return this.marketService.deleteMarket(id);
    }

    @Patch('/status/:id')
    @UseGuards(AuthGuard())
    updatemarketStatus(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('status', ListingStatusValidationPipe) status: ListingStatus,
        @Body('statusnote') statusNote?: string,
        ): Promise<Market> {
            return this.marketService.updateMarketStatus(id, status, statusNote);
    }

    @Patch('/tag/:id')
    @UseGuards(AuthGuard())
    updateMarketTags(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('tags') tags: string[],
        ): Promise<Market> {
            return this.marketService.updateMarketTags(id, tags);
    }

    @Patch('/update/:id')
    @UseGuards(AuthGuard())
    updatemarket(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() createMarketDto: CreateMarketDto,
        ): Promise<void> {
            return this.marketService.updateMarket(id, createMarketDto);
    }

    @Post('/images/:id')
    @UseGuards(AuthGuard())
    @UseInterceptors(FilesInterceptor('image'))
    uploadImage(@UploadedFiles() images: any, @Param('id', new ParseUUIDPipe()) id: string): Promise<string[]> {
        return this.marketService.uploadMarketImages(id, images);
    }

    @Post('/watch/:id')
    @UseGuards(AuthGuard())
    watch(@Param('id') id: string, @GetUser() user: UserEntity): Promise<Market> {
      return this.marketService.watchMarket(id, user.id);
    }

    @Post('/unwatch/:id')
    @UseGuards(AuthGuard())
    unwatch(@Param('id') id: string, @GetUser() user: UserEntity): Promise<Market> {
      return this.marketService.unWatchMarket(id, user.id);
    }

    @Delete('/images/:id')
    @UseGuards(AuthGuard())
    deleteCategoryImages(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<string[]> {
        return this.marketService.deleteMarketImages(id);
    }
}
