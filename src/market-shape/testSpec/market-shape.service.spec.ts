import { Test, TestingModule } from '@nestjs/testing';
import { MarketShapeService } from '../market-shape.service';

describe('MarketShapeService', () => {
  let service: MarketShapeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarketShapeService],
    }).compile();

    service = module.get<MarketShapeService>(MarketShapeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
