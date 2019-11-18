import { Test } from '@nestjs/testing';
import { CategoryService } from '../category.service';
import { CategoryRepository } from '../category.repository';
import { GetCategoryFilterDto } from '../helpers/get-category-filter.dto';
import { ListingStatus } from '../../shared/enums/listing-status.enum';
import { NotFoundException, Delete } from '@nestjs/common';

const mockCategoryRepository = () => ({
    getCategories: jest.fn(),
    findOne: jest.fn(),
    createCategory: jest.fn(),
    delete: jest.fn(),
});

describe('CategoryService', () => {
   let categoryService: CategoryService;
   let categoryRepository: any;
   beforeEach(async () => {
       const module = await Test.createTestingModule({
            providers: [
                CategoryService,
                { provide: CategoryRepository, useFactory: mockCategoryRepository },
            ],
       }).compile();

       categoryService = await module.get<CategoryService>(CategoryService);
       categoryRepository = await module.get<CategoryRepository>(CategoryRepository);
   });

   describe('getCategories', () => {
        it('Gets all categories from the repository', async () => {
            categoryRepository.getCategories.mockResolvedValue('someValue');
            expect(categoryRepository.getCategories).not.toHaveBeenCalled();
            const filters: GetCategoryFilterDto = { status: ListingStatus.PENDING_REVIEW, search: 'Some Search query' };
            const result = await categoryService.getCategories(filters);
            expect(categoryRepository.getCategories).toHaveBeenCalled();
            expect(result).toEqual('someValue');
        });
   });

   describe('getCategoryById', () => {
       it('calls categoryRepository.findOne() and successfully retrieves and returns the Category', async () => {
            const mockCategory = {name: 'Test Category', info: 'Test info'};
            categoryRepository.findOne.mockResolvedValue(mockCategory);
            const result = await categoryService.getCategoryById('xyx');
            expect(result).toEqual(mockCategory);
       });

       it('throws an error as category is not found', () => {
            categoryRepository.findOne.mockResolvedValue(null);
            expect(categoryService.getCategoryById('xyx')).rejects.toThrow(NotFoundException);
       });
    });

   describe('createCategory', () => {
        it('calls categoryRepository.create() and returns the result', async () => {
            categoryRepository.createCategory.mockResolvedValue('someCategory');
            expect(categoryRepository.createCategory).not.toHaveBeenCalled();
            const createCategoryDto = {name: 'Test Category', info: 'Test info', images: []} ;
            const result = await categoryService.createCategory(createCategoryDto);
            expect(categoryRepository.createCategory).toHaveBeenCalledWith(createCategoryDto);
            expect(result).toEqual('someCategory');
        });
    });

   describe('deleteCategory', () => {
        it('calls categoryRepository.deleteCategory() and successfully deletes a category', async () => {
             categoryRepository.delete.mockResolvedValue({ affected: 1 });
             expect(categoryRepository.delete).not.toHaveBeenCalled();
             await categoryService.deleteCategory('xyx');
             expect(categoryRepository.delete).toHaveBeenCalled();
        });

        it('throws an error as category is not found', () => {
             categoryRepository.delete.mockResolvedValue({affected: 0});
             expect(categoryService.deleteCategory('xyx')).rejects.toThrow(NotFoundException);
        });
     });

   describe('updateCategory', () => {
          it('updates a status', async () => {
               const save = jest.fn().mockResolvedValue(true);
               categoryService.getCategoryById = jest.fn().mockResolvedValue({
                    status: ListingStatus.RECEIVED,
                    save,
               });
               expect(categoryService.getCategoryById).not.toHaveBeenCalled();
               expect(save).not.toHaveBeenCalled();
               const result = await categoryService.updateCategoryStatus('xyx', ListingStatus.APPROVED);
               expect(categoryService.getCategoryById).toHaveBeenCalled();
               expect(save).toHaveBeenCalled();
               expect(result.status).toEqual(ListingStatus.APPROVED);
          });
     });
});
