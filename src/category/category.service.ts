import { Injectable, NotFoundException, NotAcceptableException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category-dto';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryRepository } from './category.repository';
import { Category } from './category.entity';
import { ListingStatus } from '../shared/enums/listing-status.enum';
import { ImgFolder } from '../shared/enums/upload-img-folder.enum';
import { S3UploadService } from 'src/shared/services/s3Uploader/awsS3Upload.service';
import { ListingStatusNote } from '../shared/enums/listing-status-note.enum';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(CategoryRepository)
        private categoryRepository: CategoryRepository,
        private readonly s3UploadService: S3UploadService,
    ) {}

    getCategories(filterDto: StatusAndSearchFilterDto, page: number = 1): Promise<Category[]> {
        return this.categoryRepository.getCategories(filterDto, page);
    }

    async getCategoryById(id: string): Promise<Category> {
        return await this.categoryRepository.findOne(id);
    }

    async getCategoriesWithMarkets(filterDto: StatusAndSearchFilterDto, page: number = 1): Promise<Category[]> {
        return await this.categoryRepository.getCategoriesWithMarkets(filterDto, page);
    }

    async getCategoryWithMarketsById(filterDto: StatusAndSearchFilterDto, categoryId: string): Promise<Category> {
        return await this.categoryRepository.getCategoryWithMarketsById(filterDto, categoryId);
     }

    async createCategory(createCategoryDto: CreateCategoryDto, images?: object[], filenameInPath?: boolean): Promise<Category> {
        const isCategoryNameUnique = await this.categoryRepository.isNameUnique(createCategoryDto.name);
        if ( isCategoryNameUnique ) {
            if ( Array.isArray(images) && images.length > 0) {
                const s3ImageArray = await this.s3UploadService.uploadImageBatch(images, ImgFolder.CATEGORY_IMG_FOLDER, filenameInPath);
                createCategoryDto.images = s3ImageArray;
            }
            return this.categoryRepository.createCategory(createCategoryDto);
        } else {
            throw new ConflictException('Category already exists');
        }
    }

    async updateCategory(id: string, createCategoryDto: CreateCategoryDto): Promise<void> {
        if ( createCategoryDto.name || createCategoryDto.info ) {
          return this.categoryRepository.updateCategory(id, createCategoryDto);
        } else {
          throw new NotAcceptableException(`Update details not provided`);
        }
    }

    async deleteCategory(id: string): Promise<void> {
        const result = await this.categoryRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }
    }

    async updateCategoryStatus(id: string, status: ListingStatus, statusNote?: string ): Promise<Category> {
        const category = await this.categoryRepository.getCategoryById(id);
        category.status = status;
        if (!statusNote) {
            switch (category.status) {
                case ListingStatus.REJECTED:
                  category.statusNote = ListingStatusNote.REJECTED;
                  break;
                default:
                  category.statusNote = null;
                }
            } else {
            category.statusNote = statusNote;
        }
        await category.save();
        return category;
    }

    async uploadCategoryImages(id: string, images: any, filenameInPath?: boolean): Promise<string[]> {
        if (images) {
            const category = await this.categoryRepository.getCategoryById(id);
            const s3ImgUrlArray = await this.s3UploadService.uploadImageBatch(images, ImgFolder.CATEGORY_IMG_FOLDER, filenameInPath);
            s3ImgUrlArray.forEach(item => {
                category.images.push(item);
            });
            await category.save();
            return category.images;
        } else {
            throw new NotAcceptableException(`File not found`);
        }
    }

    async deleteCategoryImages(id: string): Promise<string[]> {
        const category = await this.categoryRepository.getCategoryById(id);
        let arrayImages: string[] = [];
        arrayImages = category.images;
        category.images = [];
        await category.save();
        return arrayImages;
    }

    // getAllCategories(): Category[] {
    //     const copiedCategories = JSON.parse(JSON.stringify(this.Categories));
    //     return copiedCategories;
    // }
}
