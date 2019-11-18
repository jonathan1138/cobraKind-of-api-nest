import { Controller, Get, ParseUUIDPipe, Param, Body } from '@nestjs/common';
import { Genre } from './genre.entity';
import { GenreService } from './genre.service';

@Controller('genre')
export class GenreController {

    constructor( private genreService: GenreService ) {}

    @Get()
    genres(): Promise<Genre[]> {
        return this.genreService.allGenres();
    }

    @Get('/exchanges')
    allExchanges(): Promise<Genre[]> {
        return this.genreService.allExchanges();
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
}
