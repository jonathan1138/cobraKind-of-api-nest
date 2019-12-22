import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TagRepository } from './tag.repository';
import { Tag } from './tag.entity';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { CategoryRepository } from 'src/category/category.repository';

@Injectable()
export class TagService {
    constructor(
        @InjectRepository(TagRepository)
        private tagRepository: TagRepository,
        @InjectRepository(CategoryRepository)
        private categoryRepository: CategoryRepository,
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

    async updateTagStatus(id: string, status: ListingStatus ): Promise<Tag> {
        const tag = await this.tagRepository.tagsById(id);
        tag.status = status;
        await tag.save();
        return tag;
    }

    async createTag(name: string, categoryId: string): Promise<Tag> {
        const category = await this.categoryRepository.getCategoryById(categoryId);
        if ( category ) {
            return this.tagRepository.createTag(name, categoryId);
        } else {
            throw new NotFoundException('Cannot find category');
        }
    }
}
