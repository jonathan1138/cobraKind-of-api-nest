import { Controller, Get, Post, UsePipes, UseInterceptors, ValidationPipe,
        ParseUUIDPipe, UploadedFiles, Param, Body, Delete, Query, Patch, UploadedFile, Logger, UseGuards } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { Exchange } from './exchange.entity';
import { ListingStatusValidationPipe } from 'src/shared/pipes/listingStatus-validation.pipe';
import { ListingVoteValidationPipe } from 'src/shared/pipes/listingVote-validation.pipe';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { CreateExchangeDto } from './dto/create-exchange-dto';
import { Genre } from 'src/exchange-genre/genre.entity';
import { SubVariation } from 'src/exchange-sub-variation/sub-variation.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/user-auth/decorators/get-user.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { IpAddress } from 'src/shared/decorators/get-user-ip.decorator';
import { ListingVote } from 'src/shared/enums/listing-vote.enum';

// @UseGuards(AuthGuard())
@Controller('exchange')
export class ExchangeController {
    constructor(private exchangeService: ExchangeService) {}

    @Get()
    getExchanges(
        @Query('page') page: number,
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
        ): Promise<Exchange[]> {
        return this.exchangeService.getExchanges(filterDto, page);
    }

    @Get('/genre')
    getWithGenres(
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto): Promise<Exchange[]> {
            return this.exchangeService.getGenres(filterDto);
    }

    @Get('/subVariation')
    getWithVariations(
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto): Promise<Exchange[]> {
            return this.exchangeService.getVariations(filterDto);
    }

    @Get('/subItem')
    getExchangesWithSubItems(
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
    ): Promise<Exchange[]> {
        return this.exchangeService.getExchangesWithSubItems(filterDto);
    }

    @Get('/:id')
    getExchangeById(
        @Param('id', new ParseUUIDPipe()) id: string, @IpAddress() ipAddress): Promise<Exchange> {
        // tslint:disable-next-line: max-line-length
        // const ip = (Math.floor(Math.random() * 255) + 1) + '.' + (Math.floor(Math.random() * 255) + 0) + '.' + (Math.floor(Math.random() * 255) + 0) + '.' + (Math.floor(Math.random() * 255) + 0);
        return this.exchangeService.getExchangeByIdIncrementView(id, ipAddress);
    }

    @Get('/market/:id')
    getExchangesByCategories(
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
        @Param('id', new ParseUUIDPipe()) marketId: string): Promise<Exchange[]> {
        return this.exchangeService.getExchangesByMarket(filterDto, marketId);
    }

    @Get('/genre/:id')
    getExchangesWithGenresByMkt(
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
        @Param('id', new ParseUUIDPipe()) id: string): Promise<Exchange[]> {
            return this.exchangeService.getGenresByMktId(id, filterDto);
    }

    @Get('/subVariation/:id')
    getExchangesWithVarsByMktId(
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
        @Param('id', new ParseUUIDPipe()) id: string): Promise<Exchange[]> {
            return this.exchangeService.getVarsByMktId(id, filterDto);
    }

    @Get('/subItem/:id')
    getSubItemsByExchangeId(
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
        @Param('id', new ParseUUIDPipe()) exchangeId: string): Promise<Exchange> {
        return this.exchangeService.getSubItemsByExchangeId(filterDto, exchangeId);
    }

    @Post('/:marketid')
    @UsePipes(ValidationPipe)
    @UseGuards(AuthGuard())
    @UseInterceptors(FilesInterceptor('images'))
    createExchange(
        @Param('marketid', new ParseUUIDPipe()) marketId: string,
        @UploadedFiles() images: any,
        @Body() createExchangeDto: CreateExchangeDto,
        @GetUser() user: UserEntity,
        ): Promise<Exchange> {
        createExchangeDto.images = images;
        return this.exchangeService.createExchange(createExchangeDto, marketId, user.id, images);
    }

    @Delete('/:id')
    @UseGuards(AuthGuard())
    deleteExchange(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
        return this.exchangeService.deleteExchange(id);
    }

    @Patch('/status/:id')
    @UseGuards(AuthGuard())
    updateExchangeStatus(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('status', ListingStatusValidationPipe) status: ListingStatus,
        @Body('statusnote') statusNote?: string,
        ): Promise<Exchange> {
            return this.exchangeService.updateExchangeStatus(id, status, statusNote);
    }

    @Patch('/genre/:id')
    @UseGuards(AuthGuard())
    updateExchangeGenres(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('genres') genres: Genre[],
        ): Promise<Exchange> {
            return this.exchangeService.updateExchangeGenres(id, genres);
    }

    @Patch('/subVariation/:id')
    @UseGuards(AuthGuard())
    updateExchangeVariation(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('subVariations') subVariations: SubVariation[],
        ): Promise<Exchange> {
            return this.exchangeService.updateExchangeVariations(id, subVariations);
    }

    @Patch('/update/:id')
    @UseGuards(AuthGuard())
    updateExchange(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() createExchangeDto: CreateExchangeDto,
        ): Promise<void> {
            return this.exchangeService.updateExchange(id, createExchangeDto);
    }

    @Post('/images/:id')
    @UseGuards(AuthGuard())
    @UseInterceptors(FilesInterceptor('image'))
    uploadImage(@UploadedFiles() images: any, @Param('id', new ParseUUIDPipe()) id: string): Promise<string[]> {
        return this.exchangeService.uploadExchangeImages(id, images);
    }

    @Delete('/images/:id')
    @UseGuards(AuthGuard())
    deleteExchangeImages(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<string[]> {
        return this.exchangeService.deleteExchangeImages(id);
    }

    @Post('/watch/:id')
    @UseGuards(AuthGuard())
    watch(@Param('id') id: string, @GetUser() user: UserEntity): Promise<Exchange>  {
      return this.exchangeService.watchExchange(id, user.id);
    }

    @Post('/unwatch/:id')
    @UseGuards(AuthGuard())
    unwatch(@Param('id') id: string, @GetUser() user: UserEntity): Promise<Exchange>  {
      return this.exchangeService.unWatchExchange(id, user.id);
    }

    @Patch('/vote/:id')
    @UseGuards(AuthGuard())
    updateVote(
        @Param('id', new ParseUUIDPipe()) id: string, @IpAddress() ipAddress,
        @Body('vote', ListingVoteValidationPipe) vote: ListingVote,
        @Body('votecomment') voteComment?: string,
        ): Promise<void> {
            return this.exchangeService.updateVote(id, ipAddress, vote, voteComment);
    }

    // @Post('/vote/:id')
    // @UseGuards(AuthGuard())
    // upvote(@Param('id') id: string, @GetUser() user: UserEntity) {
    //   return this.exchangeService.upvote(id, user.id);
    // }

    // @Post('/downvote/:id')
    // @UseGuards(AuthGuard())
    // downvote(@Param('id') id: string, @GetUser() user: UserEntity) {
    //   return this.exchangeService.downvote(id, user.id);
    // }
}
