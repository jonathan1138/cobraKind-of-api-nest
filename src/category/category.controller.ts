import { Controller, Get, Post, Body, Param, Delete,
            Patch, Query, UsePipes, ValidationPipe, UseGuards,
            ParseUUIDPipe, UseInterceptors, UploadedFile, UploadedFiles, Logger } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category-dto';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { ListingStatusValidationPipe } from '../shared/pipes/listingStatus-validation.pipe';
import { Category } from './category.entity';
import { ListingStatus } from '../shared/enums/listing-status.enum';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/shared/inteceptors/multerOptions.interceptor';

@Controller('category')
// @UseGuards(AuthGuard())
export class CategoryController {
    constructor(private categoryService: CategoryService) {}

    @Get()
    getCategories(
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
        ): Promise<Category[]> {
        return this.categoryService.getCategories(filterDto);
    }

    @Get('/markets')
    getCategoriesWithMarkets(
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
    ): Promise<Category[]> {
        return this.categoryService.getCategoriesWithMarkets(filterDto);
    }

    @Get('/:id')
    getCategoryById(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<Category> {
        return this.categoryService.getCategoryById(id);
    }

    @Get('/markets/:id')
    getCategoryWithMarketsById(
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
        @Param('id', new ParseUUIDPipe()) categoryId: string): Promise<Category> {
        return this.categoryService.getCategoryWithMarketsById(filterDto, categoryId);
    }

    @Post()
    @UsePipes(ValidationPipe)
    @UseInterceptors(FilesInterceptor('images'))
    createCategory(
        @UploadedFiles() images: any,
        @Body() createCategoryDto: CreateCategoryDto,
        ): Promise<Category> {
        createCategoryDto.images = images;
        return this.categoryService.createCategory(createCategoryDto, images);
    }

    @Delete('/:id')
    deleteCategory(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
        return this.categoryService.deleteCategory(id);
    }

    @Patch('/status/:id')
    updatecategoryStatus(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('status', ListingStatusValidationPipe) status: ListingStatus,
        ): Promise<Category> {
            return this.categoryService.updateCategoryStatus(id, status);
    }

    @Post('/images/:id')
    @UseInterceptors(FileInterceptor('image'))
    uploadImage(@UploadedFile() image: any, @Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
        return this.categoryService.uploadCategoryImage(id, image);
    }

    @Delete('/images/:id')
    deleteCategoryImages(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<string[]> {
        return this.categoryService.deleteCategoryImages(id);
    }

    @Post('/file/:dest')
    @UseInterceptors(FileInterceptor('file', multerOptions ))
        async upload(
        @Param('destination') destination: string,
        @UploadedFile() file: string): Promise<void> {
        Logger.log(file);
        const filename = Object.values(file)[1];
        this.importfiletodb('categories' + '/' + filename);
    }

    @Post('/importfiletodb')
    importfiletodb(
        @Body('filename') filename: string): Promise<void> {
        return this.categoryService.loadCategoriesFile(filename);
    }
}
