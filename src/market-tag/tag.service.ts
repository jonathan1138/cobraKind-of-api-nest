import { Injectable, NotFoundException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TagRepository } from './tag.repository';
import { Tag } from './tag.entity';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { CategoryRepository } from 'src/category/category.repository';
import { CreateTagDto } from './dto/create-tag-dto';

@Injectable()
export class TagService {
    constructor(
        @InjectRepository(TagRepository)
        private tagRepository: TagRepository,
        @InjectRepository(CategoryRepository)
        private categoryRepository: CategoryRepository,
    ) {}

    async allTags(page: number = 1): Promise<Tag[]> {
        return this.tagRepository.allTags(page);
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

    async updateTag(id: string, createTagDto: CreateTagDto): Promise<void> {
        if ( createTagDto.name ) {
            const tag = await this.tagRepository.tagsById(id);
            if (tag) {
                tag.name = createTagDto.name;
                await tag.save();
            } else {
                throw new NotFoundException('Cannot find Tag');
            }
        } else {
          throw new NotAcceptableException(`Update details not provided`);
        }
    }

    async createTag(createTagDto: CreateTagDto, categoryId: string): Promise<Tag> {
        const category = await this.categoryRepository.getCategoryById(categoryId);
        if ( category ) {
            return this.tagRepository.createTag(createTagDto, categoryId);
        } else {
            throw new NotFoundException('Cannot find category');
        }
    }

    async deleteTag(id: string): Promise<void> {
        const result = await this.tagRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Tag with ID ${id} not found`);
        }
    }
}
