import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Genre } from './genre.entity';
import { GenreRepository } from './genre.repository';

@Injectable()
export class GenreService {
    constructor(
        @InjectRepository(GenreRepository)
        private genreRepository: GenreRepository,
    ) {}

    async allGenres(page: number = 1): Promise<Genre[]> {
        return this.genreRepository.allGenres(page);
    }

    async allExchanges(): Promise<Genre[]> {
        return this.genreRepository.allExchanges();
    }

    async exchangesByGenres(ids: string[]): Promise<Genre[]> {
        return this.genreRepository.exchangesByGenres(ids);
    }

    async genresByMarket(id: string): Promise<Genre[]> {
        return this.genreRepository.genresByMarket(id);
    }

    async genresByName(name: string): Promise<Genre> {
        return this.genreRepository.genresByName(name);
    }

    async genresForExchange(id: string): Promise<Genre[]> {
        return this.genreRepository.genresForExchange(id);
    }
}
