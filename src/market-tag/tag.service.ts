import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TagRepository } from './tag.repository';
import { Tag } from './tag.entity';

@Injectable()
export class TagService {
    constructor(
        @InjectRepository(TagRepository)
        private tagRepository: TagRepository,
    ) {}

    async allTags(): Promise<Tag[]> {
        return this.tagRepository.allTags();
    }

    async allMarkets(): Promise<Tag[]> {
        return this.tagRepository.allMarkets();
    }

    async marketsByTags(ids: string[]): Promise<Tag[]> {
        return this.tagRepository.marketsByTags(ids);
    }

    async tagsByCategory(id: string): Promise<Tag[]> {
        return this.tagRepository.tagsByCategory(id);
    }

    async tagsByName(name: string): Promise<Tag> {
        return this.tagRepository.tagsByName(name);
    }

    async tagsById(id: string): Promise<Tag> {
        return this.tagRepository.tagsById(id);
    }

    async tagsForMarket(id: string): Promise<Tag[]> {
        return this.tagRepository.tagsForMarket(id);
    }
}
