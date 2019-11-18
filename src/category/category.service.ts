import { Injectable, ParseUUIDPipe, NotFoundException, NotAcceptableException, ConflictException, Logger } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category-dto';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryRepository } from './category.repository';
import { Category } from './category.entity';
import { ListingStatus } from '../shared/enums/listing-status.enum';
import { ImgFolder } from '../shared/enums/upload-img-folder.enum';
import { S3UploadService } from 'src/shared/services/awsS3Upload.service';
import { FileReaderService } from '../shared/services/csvFileReaders/fileReader.service';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(CategoryRepository)
        private categoryRepository: CategoryRepository,
        private readonly s3UploadService: S3UploadService,
        private readonly fileReaderService: FileReaderService,
    ) {}

    getCategories(filterDto: StatusAndSearchFilterDto): Promise<Category[]> {
        return this.categoryRepository.getCategories(filterDto);
    }

    async getCategoryById(id: string): Promise<Category> {
        return await this.categoryRepository.findOne(id);
    }

    async getCategoriesWithMarkets(filterDto: StatusAndSearchFilterDto): Promise<Category[]> {
        return await this.categoryRepository.getCategoriesWithMarkets(filterDto);
    }

    async getCategoryWithMarketsById(filterDto: StatusAndSearchFilterDto, categoryId: string): Promise<Category> {
        return await this.categoryRepository.getCategoryWithMarketsById(filterDto, categoryId);
     }

    async createCategory(createCategoryDto: CreateCategoryDto, images?: object[]): Promise<Category> {
        const isCategoryNameUnique = await this.categoryRepository.isNameUnique(createCategoryDto.name);
        if ( isCategoryNameUnique ) {
            if ( Array.isArray(images) && images.length > 0) {
                const s3ImageArray = await this.s3UploadService.uploadImageBatch(images, ImgFolder.CATEGORY_IMG_FOLDER);
                createCategoryDto.images = s3ImageArray;
            }
            return this.categoryRepository.createCategory(createCategoryDto);
        } else {
            throw new ConflictException('Category already exists');
        }
    }

    async deleteCategory(id: string): Promise<void> {
        const result = await this.categoryRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }
    }

    async updateCategoryStatus(id: string, status: ListingStatus ): Promise<Category> {
        const category = await this.categoryRepository.getCategoryById(id);
        category.status = status;
        await category.save();
        return category;
    }

    async uploadCategoryImage(id: string, image: any): Promise<void> {
        if (image) {
            const category = await this.categoryRepository.getCategoryById(id);
            if ( image ) {
                const s3ImgUrl = await this.s3UploadService.uploadImage(image, ImgFolder.CATEGORY_IMG_FOLDER);
                category.images.push(s3ImgUrl);
                await category.save();
            }
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

    async loadCategoriesFile(filename: string): Promise<void> {
        this.fileReaderService.importCategoryFileToDb(filename);
    }

    // getAllCategories(): Category[] {
    //     const copiedCategories = JSON.parse(JSON.stringify(this.Categories));
    //     return copiedCategories;
    // }
}