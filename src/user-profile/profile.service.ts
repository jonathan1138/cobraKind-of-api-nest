import { Injectable, NotFoundException, Post, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileRepository } from './profile.repository';
import { UserRepository } from 'src/user/user.repository';
import { Profile } from './profile.entity';
import { TagRepository } from 'src/market-tag/tag.repository';
import { Tag } from 'src/market-tag/tag.entity';
import { Market } from '../market/market.entity';
import { MarketRepository } from 'src/market/market.repository';
import { Exchange } from 'src/market-exchange/exchange.entity';
import { ExchangeRepository } from 'src/market-exchange/exchange.repository';
import { Part } from '../market-part/part.entity';
import { PartRepository } from 'src/market-part/part.repository';
import { SubItemRepository } from 'src/exchange-subs/exchange-sub-item/sub-item.repository';
import { SubItem } from 'src/exchange-subs/exchange-sub-item/sub-item.entity';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(ProfileRepository) private profileRepository: ProfileRepository,
        @InjectRepository(UserRepository) private userRepository: UserRepository,
        @InjectRepository(TagRepository) private tagRepository: TagRepository,
        @InjectRepository(MarketRepository) private marketRepository: MarketRepository,
        @InjectRepository(ExchangeRepository) private exchangeRepository: ExchangeRepository,
        @InjectRepository(SubItemRepository) private subItemRepository: SubItemRepository,
        @InjectRepository(PartRepository) private partRepository: PartRepository,
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

    async updateWatchedTags(id: string, tags: string[] ): Promise<void> {
        const user = await this.userRepository.getUserByIdWatched(id);
        const profile = await this.profileRepository.findOne(user.profile.id, {relations: ['watchedTags']});
        profile.watchedTags = await this.processTags(tags);
        this.profileRepository.save(profile);
    }

    private async processTags(tags: string[]): Promise<Tag[]> {
        const newTags: Tag[] = [];
        if (tags) {
            const uploadPromises = tags.map(async (tag, index: number) => {
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
        const user = await this.userRepository.getUserByIdWatched(id);
        const profile = await this.profileRepository.findOne(user.profile.id, {relations: ['watchedMarkets']});
        const currentMarkets = profile.watchedMarkets.map(a => a.id);
        let toRemove = [];
        let toAdd = [];
        if (markets) {
            toRemove = currentMarkets.filter(x => !markets.includes(x));
            toAdd = markets.filter(x => !currentMarkets.includes(x));
        } else {
            toRemove = currentMarkets;
        }
        profile.watchedMarkets = await this.processMarkets(markets, toAdd);
        toRemove.forEach(async (market) => {
            const foundMarket = await this.marketRepository.findOne({id: market});
            if (foundMarket.watchCount >= 0) {
                foundMarket.watchCount--;
                foundMarket.save();
            }

        });
        this.profileRepository.save(profile);
    }

    private async processMarkets(markets: string[], toAdd: string[]): Promise<Market[]> {
        const newMarkets: Market[] = [];
        if (markets) {
            const uploadPromises = markets.map(async (market, index: number) => {
                // formerly find one by name; changed on 11/24
                const foundMarket = await this.marketRepository.findOne({id: market});
                if (foundMarket) {
                    newMarkets.push(foundMarket);
                    if (toAdd.includes(foundMarket.id)) {
                        foundMarket.watchCount++;
                        foundMarket.save();
                    }
                }
            });
            await Promise.all(uploadPromises);
        }
        return newMarkets;
    }

    async updateWatchedParts(id: string, parts: string[] ): Promise<void> {
        const user = await this.userRepository.getUserByIdWatched(id);
        const profile = await this.profileRepository.findOne(user.profile.id, {relations: ['watchedParts']});
        const currentParts = profile.watchedParts.map(a => a.id);
        let toRemove = [];
        let toAdd = [];
        if (parts) {
            toRemove = currentParts.filter(x => !parts.includes(x));
            toAdd = parts.filter(x => !currentParts.includes(x));
        } else {
            toRemove = currentParts;
        }
        profile.watchedParts = await this.processParts(parts, toAdd);
        toRemove.forEach(async (market) => {
            const foundPart = await this.partRepository.findOne({id: market});
            if (foundPart.watchCount >= 0) {
                foundPart.watchCount--;
                foundPart.save();
            }

        });
        this.profileRepository.save(profile);
    }

    private async processParts(parts: string[], toAdd: string[]): Promise<Part[]> {
        const newParts: Part[] = [];
        if (parts) {
            const uploadPromises = parts.map(async (part, index: number) => {
                // formerly find one by name; changed on 11/24
                const foundPart = await this.partRepository.findOne({id: part});
                if (foundPart) {
                    newParts.push(foundPart);
                    if (toAdd.includes(foundPart.id)) {
                        foundPart.watchCount++;
                        foundPart.save();
                    }
                }
            });
            await Promise.all(uploadPromises);
        }
        return newParts;
    }

    async updateWatchedExchanges(id: string, exchanges: string[] ): Promise<void> {
        const user = await this.userRepository.getUserByIdWatched(id);
        const profile = await this.profileRepository.findOne(user.profile.id,  {relations: ['watchedExchanges']});
        const currentExchanges = profile.watchedExchanges.map(a => a.id);
        let toRemove = [];
        let toAdd = [];
        if (exchanges) {
            toRemove = currentExchanges.filter(x => !exchanges.includes(x));
            toAdd = exchanges.filter(x => !currentExchanges.includes(x));
        } else {
            toRemove = currentExchanges;
        }
        profile.watchedExchanges = await this.processExchanges(exchanges, toAdd);
        toRemove.forEach(async (exchange) => {
            const foundExchange = await this.exchangeRepository.findOne({id: exchange});
            if (foundExchange.watchCount >= 0) {
                foundExchange.watchCount--;
                foundExchange.save();
            }

        });
        this.profileRepository.save(profile);
    }

    private async processExchanges(exchanges: string[], toAdd: string[]): Promise<Exchange[]> {
        const newExchanges: Exchange[] = [];
        if (exchanges) {
            const uploadPromises = exchanges.map(async (exchange) => {
                // formerly find one by name; changed on 11/24
                const foundExchange = await this.exchangeRepository.findOne({id: exchange});
                if (foundExchange) {
                    newExchanges.push(foundExchange);
                    if (toAdd.includes(foundExchange.id)) {
                        foundExchange.watchCount++;
                        foundExchange.save();
                    }
                }
            });
            await Promise.all(uploadPromises);
        }
        return newExchanges;
    }

    async updateWatchedSubItems(id: string, subItems: string[] ): Promise<void> {
        const user = await this.userRepository.getUserByIdWatched(id);
        const profile = await this.profileRepository.findOne(user.profile.id,  {relations: ['watchedSubItems']});
        const currentSubItems = profile.watchedSubItems.map(a => a.id);
        let toRemove = [];
        let toAdd = [];
        if (subItems) {
            toRemove = currentSubItems.filter(x => !subItems.includes(x));
            toAdd = subItems.filter(x => !currentSubItems.includes(x));
        } else {
            toRemove = currentSubItems;
        }
        profile.watchedSubItems = await this.processSubItems(subItems, toAdd);
        toRemove.forEach(async (subItem) => {
            const foundSubItem = await this.subItemRepository.findOne({id: subItem});
            if (foundSubItem.watchCount >= 0) {
                foundSubItem.watchCount--;
                foundSubItem.save();
            }

        });
        this.profileRepository.save(profile);
    }

    private async processSubItems(subItems: string[], toAdd: string[]): Promise<SubItem[]> {
        const newSubItems: SubItem[] = [];
        if (subItems) {
            const uploadPromises = subItems.map(async (subItem, index: number) => {
                // formerly find one by name; changed on 11/24
                const foundSubItem = await this.subItemRepository.findOne({id: subItem});
                if (foundSubItem) {
                    newSubItems.push(foundSubItem);
                    if (toAdd.includes(foundSubItem.id)) {
                        foundSubItem.watchCount++;
                        foundSubItem.save();
                    }
                }
            });
            await Promise.all(uploadPromises);
        }
        return newSubItems;
    }
}
