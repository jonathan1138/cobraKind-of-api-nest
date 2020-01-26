import { Test, TestingModule } from '@nestjs/testing';
import { SubItemService } from '../sub-item.service';

describe('SubItemService', () => {
  let service: SubItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubItemService],
    }).compile();

    service = module.get<SubItemService>(SubItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
