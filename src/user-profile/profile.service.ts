import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileRepository } from './profile.repository';
import { UserRepository } from 'src/user/user.repository';
import { TagData } from 'src/shared/enums/tag-data.enum';
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

    async updatePreferredTags(id: string, tags: TagData[] ): Promise<void> {
        const user = await this.userRepository.getUserById(id);
        const profile = await this.profileRepository.findOne(user.profile.id);
        profile.watchedTags = await this.processTags(tags);
        this.profileRepository.save(profile);
    }

    private async processTags(tags: TagData[]): Promise<Tag[]> {
        const newTags: Tag[] = [];
        let assureArray = [];
        if ( !Array.isArray(tags) ) {
            assureArray.push(tags);
        } else {
            assureArray = [...tags];
        }
        const uploadPromises = assureArray.map(async (tag, index: number) => {
            const foundTag = await this.tagRepository.tagsByName(tag);
            if (foundTag) {
                newTags.push(foundTag);
            }
        });
        await Promise.all(uploadPromises);
        return newTags;
    }

    async updatePreferredMarkets(id: string, markets: string[] ): Promise<void> {
        const user = await this.userRepository.getUserById(id);
        const profile = await this.profileRepository.findOne(user.profile.id);
        profile.watchedMarkets = await this.processMarkets(markets);
        this.profileRepository.save(profile);
    }

    private async processMarkets(markets: string[]): Promise<Market[]> {
        const newMarkets: Market[] = [];
        let assureArray = [];
        if ( !Array.isArray(markets) ) {
            assureArray.push(markets);
        } else {
            assureArray = [...markets];
        }
        const uploadPromises = assureArray.map(async (market, index: number) => {
            const foundMarket = await this.marketRepository.findOne({name: market});
            if (foundMarket) {
                newMarkets.push(foundMarket);
            }
        });
        await Promise.all(uploadPromises);
        return newMarkets;
    }

    async updatePreferredExchanges(id: string, exchanges: string[] ): Promise<void> {
        const user = await this.userRepository.getUserById(id);
        const profile = await this.profileRepository.findOne(user.profile.id);
        profile.watchedExchanges = await this.processExchanges(exchanges);
        this.profileRepository.save(profile);
    }

    private async processExchanges(exchanges: string[]): Promise<Exchange[]> {
        const newExchanges: Exchange[] = [];
        let assureArray = [];
        if ( !Array.isArray(exchanges) ) {
            assureArray.push(exchanges);
        } else {
            assureArray = [...exchanges];
        }
        const uploadPromises = assureArray.map(async (exchange, index: number) => {
            const foundExchange = await this.exchangeRepository.findOne({name: exchange});
            if (foundExchange) {
                newExchanges.push(foundExchange);
            }
        });
        await Promise.all(uploadPromises);
        return newExchanges;
    }
}
