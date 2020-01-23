import { Injectable, NotFoundException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Genre } from './genre.entity';
import { GenreRepository } from './genre.repository';
import { CreateGenreDto } from './dto/create-genre-dto';
import { MarketRepository } from 'src/market/market.repository';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { ListingStatusNote } from 'src/shared/enums/listing-status-note.enum';
import { Market } from '../market/market.entity';
import { Exchange } from 'src/exchange/exchange.entity';
import { ExchangeRepository } from 'src/exchange/exchange.repository';

@Injectable()
export class GenreService {
    constructor(
        @InjectRepository(GenreRepository)
        private genreRepository: GenreRepository,
        @InjectRepository(MarketRepository)
        private marketRepository: MarketRepository,
        @InjectRepository(ExchangeRepository)
        private exchangeRepository: ExchangeRepository,
    ) {}

    async getGenres(page: number = 1): Promise<Genre[]> {
        return this.genreRepository.getGenres(page);
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
                default:
                    genre.statusNote = null;
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
                if (createGenreDto.markets) {
                    await this.processCreateMarketsArray(createGenreDto.markets);
                    genre.markets = createGenreDto.markets;
                } else {
                    genre.markets = [];
                }
                if (createGenreDto.exchanges) {
                    await this.processCreateExchangesArray(createGenreDto.exchanges, createGenreDto.markets);
                    genre.exchanges = createGenreDto.exchanges;
                } else {
                    genre.exchanges = [];
                }
                await genre.save();
            } else {
                throw new NotFoundException('Cannot find Genre');
            }
        } else {
          throw new NotAcceptableException(`Update details not provided`);
        }
    }

    async createGenre(createGenreDto: CreateGenreDto, userId: string): Promise<Genre> {
        await this.processCreateMarketsArray(createGenreDto.markets);
        await this.processCreateExchangesArray(createGenreDto.exchanges, createGenreDto.markets);
        return this.genreRepository.createGenre(createGenreDto);
    }

    async processCreateExchangesArray(exchanges: Exchange[], markets: Market[]): Promise<Exchange[]> {
        const newExchanges: Exchange[] = [];
        let assureArray = [];
        if ( !Array.isArray(exchanges) ) {
            assureArray.push(exchanges);
        } else {
            assureArray = [...exchanges];
        }
        const uploadPromises = assureArray.map(async (exchange, index: number) => {
            const foundExchange = await this.exchangeRepository.getExchangeById(exchange.id);
            if (foundExchange) {
                const marketMatch = markets.find(item => item.id === foundExchange.marketId);
                if (marketMatch) {
                    newExchanges.push(foundExchange);
                } else {
                    throw new NotAcceptableException(`Exchange must match Genre Market`);
                }
            } else {
                throw new NotFoundException(`Exchange with ID not found`);
            }
        });
        await Promise.all(uploadPromises);
        return newExchanges;
    }

    async processCreateMarketsArray(markets: Market[]): Promise<Market[]> {
        const newMarkets: Market[] = [];
        let assureArray = [];
        if ( !Array.isArray(markets) ) {
            assureArray.push(markets);
        } else {
            assureArray = [...markets];
        }
        const uploadPromises = assureArray.map(async (market, index: number) => {
            const foundMarket = await this.marketRepository.getMarketById(market.id);
            if (foundMarket) {
                newMarkets.push(foundMarket);
            } else {
                throw new NotFoundException(`Market with ID not found`);
            }
        });
        await Promise.all(uploadPromises);
        return newMarkets;
    }

    async deleteGenre(id: string): Promise<void> {
        const result = await this.genreRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Genre with ID ${id} not found`);
        }
    }
}
