import { Injectable, NotFoundException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Genre } from './genre.entity';
import { GenreRepository } from './genre.repository';
import { CreateGenreDto } from './dto/create-genre-dto';
import { MarketRepository } from 'src/market/market.repository';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { ListingStatusNote } from 'src/shared/enums/listing-status-note.enum';

@Injectable()
export class GenreService {
    constructor(
        @InjectRepository(GenreRepository)
        private genreRepository: GenreRepository,
        @InjectRepository(MarketRepository)
        private marketRepository: MarketRepository,
    ) {}

    async allGenres(page: number = 1): Promise<Genre[]> {
        return this.genreRepository.allGenres(page);
    }

    async allExchanges(page: number = 1): Promise<Genre[]> {
        return this.genreRepository.allExchanges(page);
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

    async genresById(id: string): Promise<Genre> {
        return this.genreRepository.genresById(id);
    }

    async updateGenreStatus(id: string, status: ListingStatus, statusNote: string ): Promise<Genre> {
        const genre = await this.genreRepository.genresById(id);
        genre.status = status;
        if (!statusNote) {
            switch (genre.status) {
                // case ListingStatus.TO_REVIEW:
                //   genre.statusNote = ListingStatusNote.TO_REVIEW;
                //   break;
                // case ListingStatus.APPROVED:
                //   genre.statusNote = ListingStatusNote.APPROVED;
                //   break;
                case ListingStatus.REJECTED:
                  genre.statusNote = ListingStatusNote.REJECTED;
                  break;
                // default:
                //   genre.statusNote = ListingStatusNote.TO_REVIEW;
                }
            } else {
            genre.statusNote = statusNote;
        }
        await genre.save();
        return genre;
    }

    async updateGenre(id: string, createGenreDto: CreateGenreDto): Promise<void> {
        if ( createGenreDto.name ) {
            const genre = await this.genreRepository.genresById(id);
            if (genre) {
                genre.name = createGenreDto.name;
                if (createGenreDto.exchanges) {
                    genre.exchanges = createGenreDto.exchanges;
                }
                await genre.save();
            } else {
                throw new NotFoundException('Cannot find Genre');
            }
        } else {
          throw new NotAcceptableException(`Update details not provided`);
        }
    }

    async createGenre(createGenreDto: CreateGenreDto, marketId: string, userId: string): Promise<Genre> {
        const market = await this.marketRepository.getMarketById(marketId);
        if ( market ) {
            const created = await this.genreRepository.createGenre(createGenreDto, marketId);
            // this.profileService.updateCreatedGenres(userId, created);
            return created;
        } else {
            throw new NotFoundException('Cannot find market');
        }
    }

    async deleteGenre(id: string): Promise<void> {
        const result = await this.genreRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Genre with ID ${id} not found`);
        }
    }
}
