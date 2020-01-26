import { Injectable, NotFoundException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TagRepository } from './tag.repository';
import { Tag } from './tag.entity';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { CategoryRepository } from 'src/category/category.repository';
import { CreateTagDto } from './dto/create-tag-dto';
import { ListingStatusNote } from 'src/shared/enums/listing-status-note.enum';
import { ProfileService } from 'src/user-profile/profile.service';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';

@Injectable()
export class TagService {
    constructor(
        @InjectRepository(TagRepository)
        private tagRepository: TagRepository,
        @InjectRepository(CategoryRepository)
        private categoryRepository: CategoryRepository,
        private readonly profileService: ProfileService,
    ) {}

    async allTags(page: number = 1): Promise<Tag[]> {
        return this.tagRepository.allTags(page);
    }

    async allMarkets(filterDto: StatusAndSearchFilterDto, page: number = 1): Promise<Tag[]> {
        return this.tagRepository.allMarkets(filterDto, page);
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

    async updateTagStatus(id: string, status: ListingStatus, statusNote: string ): Promise<Tag> {
        const tag = await this.tagRepository.tagsById(id);
        tag.status = status;
        if (!statusNote) {
            switch (tag.status) {
                // case ListingStatus.TO_REVIEW:
                //   tag.statusNote = ListingStatusNote.TO_REVIEW;
                //   break;
                // case ListingStatus.APPROVED:
                //   tag.statusNote = ListingStatusNote.APPROVED;
                //   break;
                case ListingStatus.REJECTED:
                  tag.statusNote = ListingStatusNote.REJECTED;
                  break;
                default:
                  tag.statusNote = null;
                }
            } else {
            tag.statusNote = statusNote;
        }
        await tag.save();
        return tag;
    }

    async updateTag(id: string, createTagDto: CreateTagDto): Promise<void> {
        if ( createTagDto.name ) {
            const tag = await this.tagRepository.tagsById(id);
            if (tag) {
                tag.name = createTagDto.name;
                if (createTagDto.markets) {
                    tag.markets = createTagDto.markets;
                }
                await tag.save();
            } else {
                throw new NotFoundException('Cannot find Tag');
            }
        } else {
          throw new NotAcceptableException(`Update details not provided`);
        }
    }

    async createTag(createTagDto: CreateTagDto, categoryId: string, userId: string): Promise<Tag> {
        const category = await this.categoryRepository.getCategoryById(categoryId);
        if ( category ) {
            const created = await this.tagRepository.createTag(createTagDto, categoryId);
            this.profileService.updateCreatedTags(userId, created);
            return created;
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
