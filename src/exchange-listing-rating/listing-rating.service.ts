import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExchangeRepository } from '../exchange/exchange.repository';
import { UserRepository } from 'src/user/user.repository';
import { ListingRatingRepository } from './listing-rating.repository';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { ListingRating } from './listing-rating.entity';
import { CreateListingRatingDto } from './dto/create-listing-rating-dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { DeleteListingRatingDto } from './dto/delete-listing-rating-dto';

@Injectable()
export class ListingRatingService {
    constructor(
        @InjectRepository(ListingRatingRepository)
        private listingRatingRepository: ListingRatingRepository,
        @InjectRepository(ExchangeRepository)
        private exchangeRepository: ExchangeRepository,
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
    ) {}

    getListingRatings(filterDto: StatusAndSearchFilterDto): Promise<ListingRating[]> {
        return this.listingRatingRepository.getListingRatings(filterDto);
    }

    async getListingRatingById(id: string): Promise<ListingRating> {
        return await this.listingRatingRepository.getListingRatingById(id);
    }

    async getListingRatingsByExchange(filterDto: StatusAndSearchFilterDto, listingRatingId: string): Promise<ListingRating[]> {
       return await this.listingRatingRepository.getListingRatingsByExchange(filterDto, listingRatingId);
    }

    async createListingRating(createListingRatingDto: CreateListingRatingDto, exchangeId: string, user: UserEntity): Promise<ListingRating> {
        const exchange = await this.exchangeRepository.getExchangeById(exchangeId);
        return this.listingRatingRepository.createListingRating(createListingRatingDto, exchange, user);
    }

    async deleteListingRating(deleteListingRatingDto: DeleteListingRatingDto): Promise<void> {
        const result = await this.listingRatingRepository.delete(deleteListingRatingDto.listingratings);
        if (result.affected === 0) {
            throw new NotFoundException(`ListingRating with ID not found`);
        }
    }

    async likeListingRating(id: string, user: UserEntity): Promise<ListingRating> {
        const listing =  await this.listingRatingRepository.getListingRatingByIdWithLikes(id);
        if (listing) {
            const foundUser = await this.userRepository.findOne(user.id);
            if (foundUser) {
                // userIp.id = foundIp.id;
            }
            const foundIndex = listing.commentLikes.findIndex(userEntity => userEntity.id === user.id);
            if ( foundIndex < 0 ) {
                listing.commentLikes.push(user);
                await listing.save();
                delete listing.commentLikes;
                this.listingRatingRepository.incrementLike(id);
            }
        }
        return listing;
    }

    async disLikeListingRating(id: string, user: UserEntity): Promise<ListingRating> {
        const listing =  await this.listingRatingRepository.getListingRatingByIdWithLikes(id);
        if (listing) {
            const foundUser = await this.userRepository.findOne(user.id);
            if (foundUser) {
                const deleteIndex = listing.commentLikes.findIndex(userEntity => userEntity.id === user.id);
                if (  deleteIndex >= 0 ) {
                listing.commentLikes.splice(deleteIndex, 1);
                this.listingRatingRepository.decrementLike(id);
                await listing.save();
            }
            }
        }
        return listing;
    }

    async voteListingRating(id: string, user: UserEntity): Promise<ListingRating> {
        const listing =  await this.listingRatingRepository.getListingRatingByIdWithLikes(id);
        if (listing) {
            const foundUser = await this.userRepository.findOne(user.id);
            if (foundUser) {
                const foundIndex = listing.commentLikes.findIndex(userEntity => userEntity.id === user.id);
                if ( foundIndex < 0 ) {
                    listing.commentLikes.push(user);
                    await listing.save();
                    delete listing.commentLikes;
                    this.listingRatingRepository.incrementLike(id);
                } else {
                    const deleteIndex = listing.commentLikes.findIndex(userEntity => userEntity.id === user.id);
                    if (  deleteIndex >= 0 ) {
                    listing.commentLikes.splice(deleteIndex, 1);
                    this.listingRatingRepository.decrementLike(id);
                    await listing.save();
                    }
                }
            }
        }
        return listing;
    }
}
