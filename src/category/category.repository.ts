import { Category } from './category.entity';
import { EntityRepository, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category-dto';
import { ListingStatus } from '../shared/enums/listing-status.enum';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { Logger, InternalServerErrorException, ConflictException, NotFoundException } from '@nestjs/common';

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
    private logger = new Logger('CategoryRepository');

    async getCategories(filterDto: StatusAndSearchFilterDto): Promise<Category[]> {
        const query = this.buildQuery(filterDto);
        try {
            const categories = await query.getMany();
            return categories;
        } catch (error) {
            this.logger.error(`Failed to get categories for user`, error.stack);
            throw new InternalServerErrorException('Failed to get categories for user');
        }
    }

    async getCategoriesWithMarkets(filterDto: StatusAndSearchFilterDto): Promise<Category[]> {
        const query = this.buildQuery(filterDto);

        if (filterDto.status) {
            const status = filterDto.status;
            query.leftJoinAndSelect('category.markets', 'market', 'market.status = :status', {status});
        } else { query.leftJoinAndSelect('category.markets', 'market'); }

        try {
            const categories = await query.getMany();
            return categories;
        } catch (error) {
            this.logger.error(`Failed to get categories for user`, error.stack);
            throw new InternalServerErrorException('Failed to get categories for user');
        }
    }

    async getCategoryWithMarketsById(filterDto: StatusAndSearchFilterDto, categoryId: string): Promise<Category> {
        const { status, search } = filterDto;
        const query = this.createQueryBuilder('category');
        query.leftJoinAndSelect('category.markets', 'market');

        if (status) {
            query.andWhere('category.status = :status', { status });
        }

        if (search) {
            query.andWhere('(category.name LIKE :search OR category.info LIKE :search)', { search: `%${search}%` });
        }
        query.andWhere('category.id = :categoryId', {categoryId});

        const category = await query.getOne();
        if (!category) {
            throw new NotFoundException('Category Not found');
        }
        return category;
    }

    private buildQuery(filterDto: StatusAndSearchFilterDto) {
        const { status, search } = filterDto;
        const query = this.createQueryBuilder('category');
        if (status) {
            query.andWhere('category.status = :status', { status });
        }
        if (search) {
            query.andWhere('(category.name LIKE :search OR category.info LIKE :search)', { search: `%${search}%` });
        }
        return query;
    }

    async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
        const { name, info, images } = createCategoryDto;
        const category = new Category();
        category.name = name;
        category.info = info;
        category.images = images;

        category.status = ListingStatus.RECEIVED;
        try {
            await category.save();
        } catch (error) {
            if (error.code === '23505') { // duplicate cat name
                throw new ConflictException('Category already exists');
            } else {
                this.logger.error(`Failed to create a category`, error.stack);
                throw new InternalServerErrorException();
            }
        }
        return category;
    }

    async isNameUnique(name: string): Promise<boolean> {
        const query = this.createQueryBuilder('category').where('category.name = :name', { name });
        try {
            const found = await query.getOne();
            if ( !found ) {
                return true;
            } else {
                return false;
            }
        } catch {
            this.logger.error(`Failed to get category requested`);
            return false;
        }
    }

    async getCategoryById(id: string): Promise<Category> {
        const found = await this.findOne(id);
        if (!found) {
            throw new NotFoundException('Category Not found');
        }
        return found;
    }
}