import { Test, TestingModule } from '@nestjs/testing';
import { SubVariationService } from '../sub-variation.service';

describe('SubVariationService', () => {
  let service: SubVariationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubVariationService],
    }).compile();

    service = module.get<SubVariationService>(SubVariationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
