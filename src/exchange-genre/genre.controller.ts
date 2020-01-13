import { Controller, Get, ParseUUIDPipe, Param, Body, Query, Patch, UseGuards, Post, Delete } from '@nestjs/common';
import { Genre } from './genre.entity';
import { GenreService } from './genre.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateGenreDto } from './dto/create-genre-dto';
import { GetUser } from 'src/user-auth/decorators/get-user.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { ListingStatusValidationPipe } from 'src/shared/pipes/listingStatus-validation.pipe';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';

@Controller('genre')
export class GenreController {

    constructor( private genreService: GenreService ) {}

    @Get()
    genres(@Query('page') page: number): Promise<Genre[]> {
        return this.genreService.allGenres(page);
    }

    @Get('/byId/:id')
    genreById(@Param('id', new ParseUUIDPipe()) id: string): Promise<Genre> {
        return this.genreService.genresById(id);
    }

    @Get('/exchanges')
    allExchanges(@Query('page') page: number): Promise<Genre[]> {
        return this.genreService.allExchanges(page);
    }

    @Get('/exchangeIds')
    exchangesByGenres(
        @Body('ids') ids: string[],
        ): Promise<Genre[]> {
        return this.genreService.exchangesByGenres(ids);
    }

    @Get('/:name')
    genreByName(@Param('name') name: string): Promise<Genre> {
        return this.genreService.genresByName(name);
    }

    @Get('exchanges/:id')
    genresForExchange(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<Genre[]> {
        return this.genreService.genresForExchange(id);
    }

    @Get('/market/:id')
    getMarketById(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<Genre[]> {
        return this.genreService.genresByMarket(id);
    }

    @Patch('/update/:id')
    @UseGuards(AuthGuard())
    updateGenre(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() createGenreDto: CreateGenreDto,
        ): Promise<void> {
            return this.genreService.updateGenre(id, createGenreDto);
    }

    @Patch('/status/:id')
    @UseGuards(AuthGuard())
    updateGenreStatus(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('status', ListingStatusValidationPipe) status: ListingStatus,
        @Body('statusnote') statusNote?: string,
        ): Promise<Genre> {
            return this.genreService.updateGenreStatus(id, status, statusNote);
    }

    @Post('/:marketid')
    @UseGuards(AuthGuard())
    createGenre(
        @Param('marketid', new ParseUUIDPipe()) marketId: string,
        @Body() createGenreDto: CreateGenreDto,
        @GetUser() user: UserEntity,
        ): Promise<Genre> {
        return this.genreService.createGenre(createGenreDto, marketId, user.id);
    }

    @Delete('/:id')
    @UseGuards(AuthGuard())
    deleteGenre(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
        return this.genreService.deleteGenre(id);
    }
}
