import { Test } from '@nestjs/testing';
import { MarketsService } from '../market.service';
import { MarketRepository } from '../market.repository';
import { GetMarketsFilterDto } from '../helpers/get-market-filter.dto';
import { ListingStatus } from '../../shared/enums/listing-status.enum';
import { NotFoundException, Delete } from '@nestjs/common';

const mockCategoryRepository = () => ({
    getMarkets: jest.fn(),
    findOne: jest.fn(),
    createCategory: jest.fn(),
    delete: jest.fn(),
});

describe('MarketsService', () => {
   let marketsService: MarketsService;
   let marketRepository: any;
   beforeEach(async () => {
       const module = await Test.createTestingModule({
            providers: [
                MarketsService,
                { provide: MarketRepository, useFactory: mockCategoryRepository },
            ],
       }).compile();

       marketsService = await module.get<MarketsService>(MarketsService);
       marketRepository = await module.get<MarketRepository>(MarketRepository);
   });

   describe('getMarkets', () => {
        it('Gets all markets from the repository', async () => {
            marketRepository.getMarkets.mockResolvedValue('someValue');
            expect(marketRepository.getMarkets).not.toHaveBeenCalled();
            const filters: GetMarketsFilterDto = { status: ListingStatus.PENDING_REVIEW, search: 'Some Search query' };
            const result = await marketsService.getMarkets(filters);
            expect(marketRepository.getMarkets).toHaveBeenCalled();
            expect(result).toEqual('someValue');
        });
   });

   describe('getCategoryById', () => {
       it('calls marketRepository.findOne() and successfully retrieves and returns the Category', async () => {
            const mockCategory = {name: 'Test Category', info: 'Test info'};
            marketRepository.findOne.mockResolvedValue(mockCategory);
            const result = await marketsService.getMarketById('xyx');
            expect(result).toEqual(mockCategory);
       });

       it('throws an error as market is not found', () => {
            marketRepository.findOne.mockResolvedValue(null);
            expect(marketsService.getMarketById('xyx')).rejects.toThrow(NotFoundException);
       });
    });

   describe('createCategory', () => {
        it('calls marketRepository.create() and returns the result', async () => {
            marketRepository.createCategory.mockResolvedValue('someCategory');
            expect(marketRepository.createCategory).not.toHaveBeenCalled();
            const createCategoryDto = {name: 'Test Category', info: 'Test info', images: []} ;
            const result = await marketsService.createMarket(createCategoryDto);
            expect(marketRepository.createCategory).toHaveBeenCalledWith(createCategoryDto);
            expect(result).toEqual('someCategory');
        });
    });

   describe('deleteCategory', () => {
        it('calls marketRepository.deleteCategory() and successfully deletes a market', async () => {
             marketRepository.delete.mockResolvedValue({ affected: 1 });
             expect(marketRepository.delete).not.toHaveBeenCalled();
             await marketsService.deleteMarket('xyx');
             expect(marketRepository.delete).toHaveBeenCalled();
        });

        it('throws an error as market is not found', () => {
             marketRepository.delete.mockResolvedValue({affected: 0});
             expect(marketsService.deleteMarket('xyx')).rejects.toThrow(NotFoundException);
        });
     });

   describe('updateCategory', () => {
          it('updates a status', async () => {
               const save = jest.fn().mockResolvedValue(true);
               marketsService.getMarketById = jest.fn().mockResolvedValue({
                    status: ListingStatus.RECEIVED,
                    save,
               });
               expect(marketsService.getMarketById).not.toHaveBeenCalled();
               expect(save).not.toHaveBeenCalled();
               const result = await marketsService.updateMarketStatus('xyx', ListingStatus.APPROVED);
               expect(marketsService.getMarketById).toHaveBeenCalled();
               expect(save).toHaveBeenCalled();
               expect(result.status).toEqual(ListingStatus.APPROVED);
          });
     });
});
