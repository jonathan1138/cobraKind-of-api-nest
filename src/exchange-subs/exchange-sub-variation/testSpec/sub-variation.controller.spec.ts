import { Test, TestingModule } from '@nestjs/testing';
import { SubVariationController } from '../sub-variation.controller';

describe('SubVariation Controller', () => {
  let controller: SubVariationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubVariationController],
    }).compile();

    controller = module.get<SubVariationController>(SubVariationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
