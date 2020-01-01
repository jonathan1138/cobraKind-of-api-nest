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
import { ListingStatusNote } from 'src/shared/enums/listing-status-note.enum';

@Controller('category')
// @UseGuards(AuthGuard())
export class CategoryController {
    constructor(private categoryService: CategoryService) {}

    @Get()
    getCategories(@Query('page') page: number,
                  @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
        ): Promise<Category[]> {
        return this.categoryService.getCategories(filterDto, page);
    }

    @Get('/markets')
    getCategoriesWithMarkets(@Query('page') page: number,
                             @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
    ): Promise<Category[]> {
        return this.categoryService.getCategoriesWithMarkets(filterDto, page);
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
    @UseGuards(AuthGuard())
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
    @UseGuards(AuthGuard())
    deleteCategory(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
        return this.categoryService.deleteCategory(id);
    }

    @Patch('/status/:id')
    @UseGuards(AuthGuard())
    updatecategoryStatus(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('status', ListingStatusValidationPipe) status: ListingStatus,
        @Body('statusnote') statusNote?: string,
        ): Promise<Category> {
            return this.categoryService.updateCategoryStatus(id, status, statusNote);
    }

    @Patch('/update/:id')
    @UseGuards(AuthGuard())
    updatecategory(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() createCategoryDto: CreateCategoryDto,
        ): Promise<void> {
            return this.categoryService.updateCategory(id, createCategoryDto);
    }

    @Post('/images/:id')
    @UseGuards(AuthGuard())
    @UseInterceptors(FilesInterceptor('image'))
    uploadImage(@UploadedFiles() images: any, @Param('id', new ParseUUIDPipe()) id: string): Promise<string[]> {
        return this.categoryService.uploadCategoryImages(id, images);
    }

    @Delete('/images/:id')
    @UseGuards(AuthGuard())
    deleteCategoryImages(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<string[]> {
        return this.categoryService.deleteCategoryImages(id);
    }
}
