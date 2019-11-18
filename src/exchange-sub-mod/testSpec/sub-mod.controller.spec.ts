import { Test, TestingModule } from '@nestjs/testing';
import { SubModController } from '../sub-mod.controller';

describe('SubMod Controller', () => {
  let controller: SubModController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubModController],
    }).compile();

    controller = module.get<SubModController>(SubModController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
