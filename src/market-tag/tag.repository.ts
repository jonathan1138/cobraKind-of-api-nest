import { Repository, EntityRepository } from 'typeorm';
import { Tag } from './tag.entity';
import { Logger, NotAcceptableException, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';

@EntityRepository(Tag)
export class TagRepository extends Repository<Tag> {
    private logger = new Logger('TagRepository');

    async allTags(): Promise<Tag[]> {
        return await this.find();
    }

    async allMarkets(): Promise<Tag[]> {
        // return await this.find({select: ['name'], relations: ['markets']});
        return await this.createQueryBuilder('tag')
        .leftJoinAndSelect('tag.markets', 'market')
        .select(['tag.name', 'tag.categoryId', 'market.id', 'market.name'])
        .getMany();
    }

    async marketsByTags(ids: string[]): Promise<Tag[]> {
        return await this.findByIds(ids, {select: ['name', 'categoryId'], relations: ['markets']});
    }

    async tagsForMarket(id: string): Promise<Tag[]> {
        return this.createQueryBuilder('tag')
        .select(['tag.name', 'tag.categoryId', 'market.id', 'market.name'])
        .innerJoin(
             'tag.markets',
             'market',
             'market.id = :marketId',
             { marketId: id },
        ).getMany();
    }

    async tagsByCategory(id: string): Promise<Tag[]> {
        const query = this.createQueryBuilder('tag');
        query.andWhere('tag.categoryId = :id', { id });
        try {
            const found = await query.getMany();
            return found;
        } catch (error) {
           // this.logger.error(`Invalid Tag Supplied`, error.stack);
            throw new NotAcceptableException('Invalid Id Supplied');
        }
    }

    async tagsByName(name: string): Promise<Tag> {
        const query = this.createQueryBuilder('tag');
        query.andWhere('tag.name = :name', { name });
        try {
            const found = await query.getOne();
            return found;
        } catch (error) {
           // this.logger.error(`Invalid Tag Supplied`, error.stack);
            throw new NotAcceptableException('Invalid Tag Supplied');
        }
    }

    async tagsById(id: string): Promise<Tag> {
        const query = this.createQueryBuilder('tag');
        query.andWhere('tag.id = :id', { id });
        try {
            const found = await query.getOne();
            return found;
        } catch (error) {
           // this.logger.error(`Invalid Tag Supplied`, error.stack);
            throw new NotAcceptableException('Invalid Tag Supplied');
        }
    }

    async createTag(name: string, categoryId: string): Promise<Tag> {
        const tag = new Tag();
        tag.name = name.replace(/,/g, ' ');
        tag.categoryId = categoryId;
        tag.status = ListingStatus.TO_REVIEW;
        try {
            await tag.save();
            return tag;
        } catch (error) {
            if (error.code === '23505') { // duplicate cat name
                this.logger.error(`Failed to create a Tag`, error.stack);
                throw new ConflictException('Name for Tag already exists');
            } else {
                this.logger.error(`Failed to create a market`, error.stack);
                throw new InternalServerErrorException();
            }
        }
    }
}
