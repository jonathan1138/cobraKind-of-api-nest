import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileRepository } from './profile.repository';
import { UserRepository } from 'src/user/user.repository';
import { Profile } from './profile.entity';
import { TagRepository } from 'src/market-tag/tag.repository';
import { Tag } from 'src/market-tag/tag.entity';
import { Market } from '../market/market.entity';
import { MarketRepository } from 'src/market/market.repository';
import { Exchange } from 'src/exchange/exchange.entity';
import { ExchangeRepository } from 'src/exchange/exchange.repository';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(ProfileRepository) private profileRepository: ProfileRepository,
        @InjectRepository(UserRepository) private userRepository: UserRepository,
        @InjectRepository(TagRepository) private tagRepository: TagRepository,
        @InjectRepository(MarketRepository) private marketRepository: MarketRepository,
        @InjectRepository(ExchangeRepository) private exchangeRepository: ExchangeRepository,
    ) {}

    async getProfiles(): Promise<Profile[]> {
        return this.profileRepository.find({relations: ['watchedMarkets', 'watchedTags']});
    }

    async getProfileByUserId(id: string): Promise<Profile> {
        const user = await this.userRepository.getUserById(id);
        const profile = await this.profileRepository.findOne(user.profile.id, {relations: ['watchedMarkets', 'watchedTags']});
        if (profile) {
            return profile;
        } else {
            throw new NotFoundException('Profile for User Id Supplied not found');
        }
    }

    async updateProfilePhoto(id: string, s3ImgUrl: string): Promise<void> {
        return this.userRepository.updateProfilePhoto(id, s3ImgUrl);
    }

    async checkIfUserExists(id: string): Promise<boolean> {
        return this.userRepository.checkUserId(id);
    }

    async updateWatchedTags(id: string, tags: string[] ): Promise<void> {
        const user = await this.userRepository.getUserById(id);
        const profile = await this.profileRepository.findOne(user.profile.id);
        profile.watchedTags = await this.processTags(tags);
        this.profileRepository.save(profile);
    }

    async updateCreatedTags(id: string, tag: Tag ): Promise<void> {
        const user = await this.userRepository.getUserByIdWCreations(id);
        const profile = await this.profileRepository.findOne(user.profile.id, {relations: ['createdTags']});
        if ( user.name.localeCompare('admin') !== 0 ) {
            profile.createdTags.push(tag);
        }
        this.profileRepository.save(profile);
    }

    async updateCreatedMarkets(id: string, market: Market ): Promise<void> {
        const user = await this.userRepository.getUserByIdWCreations(id);
        const profile = await this.profileRepository.findOne(user.profile.id, {relations: ['createdMarkets']});
        if ( user.name.localeCompare('admin') !== 0 ) {
            profile.createdMarkets.push(market);
        }
        this.profileRepository.save(profile);
    }

    async updateCreatedExchanges(id: string, exchange: Exchange ): Promise<void> {
        const user = await this.userRepository.getUserByIdWCreations(id);
        const profile = await this.profileRepository.findOne(user.profile.id, {relations: ['createdExchanges']});
        if ( user.name.localeCompare('admin') !== 0 ) {
            profile.createdExchanges.push(exchange);
        }
        this.profileRepository.save(profile);
    }

    private async processTags(tags: string[]): Promise<Tag[]> {
        const newTags: Tag[] = [];
        let assureArray = [];
        if (tags) {
            if ( !Array.isArray(tags) ) {
                assureArray.push(tags);
            } else {
                assureArray = [...tags];
            }
        }
        if (assureArray.length) {
            const uploadPromises = assureArray.map(async (tag, index: number) => {
                const foundTag = await this.tagRepository.tagsById(tag);
                if (foundTag) {
                    newTags.push(foundTag);
                }
            });
            await Promise.all(uploadPromises);
        }
        return newTags;
    }

    async updateWatchedMarkets(id: string, markets: string[] ): Promise<void> {
        const user = await this.userRepository.getUserById(id);
        const profile = await this.profileRepository.findOne(user.profile.id);
        profile.watchedMarkets = await this.processMarkets(markets);
        this.profileRepository.save(profile);
    }

    private async processMarkets(markets: string[]): Promise<Market[]> {
        const newMarkets: Market[] = [];
        let assureArray = [];
        if (markets) {
            if ( !Array.isArray(markets) ) {
                assureArray.push(markets);
            } else {
                assureArray = [...markets];
            }
        }
        if (assureArray.length) {
            const uploadPromises = assureArray.map(async (market, index: number) => {
                // formerly find one by name; changed on 11/24
                const foundMarket = await this.marketRepository.findOne({id: market});
                if (foundMarket) {
                    newMarkets.push(foundMarket);
                }
            });
            await Promise.all(uploadPromises);
        }
        return newMarkets;
    }

    async updateWatchedExchanges(id: string, exchanges: string[] ): Promise<void> {
        const user = await this.userRepository.getUserById(id);
        const profile = await this.profileRepository.findOne(user.profile.id);
        profile.watchedExchanges = await this.processExchanges(exchanges);
        this.profileRepository.save(profile);
    }

    private async processExchanges(exchanges: string[]): Promise<Exchange[]> {
        const newExchanges: Exchange[] = [];
        let assureArray = [];
        if (exchanges) {
            if ( !Array.isArray(exchanges) ) {
                assureArray.push(exchanges);
            } else {
                assureArray = [...exchanges];
            }
        }
        if (assureArray.length) {
            const uploadPromises = assureArray.map(async (exchange, index: number) => {
                // formerly find one by name; changed on 11/24
                const foundExchange = await this.exchangeRepository.findOne({id: exchange});
                if (foundExchange) {
                    newExchanges.push(foundExchange);
                }
            });
            await Promise.all(uploadPromises);
        }
        return newExchanges;
    }
}
