import { Controller, Get, ParseUUIDPipe, Param, Body, Query, Patch, UseGuards, Post, Delete, ValidationPipe } from '@nestjs/common';
import { Genre } from './genre.entity';
import { GenreService } from './genre.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateGenreDto } from './dto/create-genre-dto';
import { GetUser } from 'src/user-auth/decorators/get-user.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { ListingStatusValidationPipe } from 'src/shared/pipes/listingStatus-validation.pipe';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';

@Controller('genre')
export class GenreController {

    constructor( private genreService: GenreService ) {}

    @Get()
    async genres(
        @Query('page') page: number,
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto): Promise<Genre[]> {
        return await this.genreService.getGenres(filterDto, page);
    }

    @Get('/byId/:id')
    genreById(@Param('id', new ParseUUIDPipe()) id: string): Promise<Genre> {
        return this.genreService.genresById(id);
    }

    // @Get('/exchangeIds')
    // exchangesByGenres(
    //     @Body('ids') ids: string[],
    //     ): Promise<Genre[]> {
    //     return this.genreService.exchangesByGenres(ids);
    // }

    @Get('/:name')
    genreByName(@Param('name') name: string): Promise<Genre> {
        return this.genreService.genresByName(name);
    }

    @Get('exchange/:id')
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

    @Post()
    @UseGuards(AuthGuard())
    createGenre(
        @Body() createGenreDto: CreateGenreDto,
        @GetUser() user: UserEntity,
        ): Promise<Genre> {
        return this.genreService.createGenre(createGenreDto, user.id);
    }

    @Delete('/:id')
    @UseGuards(AuthGuard())
    deleteGenre(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
        return this.genreService.deleteGenre(id);
    }
}
