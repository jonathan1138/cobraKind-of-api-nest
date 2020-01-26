import { Test, TestingModule } from '@nestjs/testing';
import { SubItemController } from '../sub-item.controller';

describe('SubItem Controller', () => {
  let controller: SubItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubItemController],
    }).compile();

    controller = module.get<SubItemController>(SubItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
