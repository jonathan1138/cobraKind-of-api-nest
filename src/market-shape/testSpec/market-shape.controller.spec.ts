import { Test, TestingModule } from '@nestjs/testing';
import { MarketShapeController } from '../market-shape.controller';

describe('MarketShape Controller', () => {
  let controller: MarketShapeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketShapeController],
    }).compile();

    controller = module.get<MarketShapeController>(MarketShapeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
