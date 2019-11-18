import { Test, TestingModule } from '@nestjs/testing';
import { PartController } from '../part.controller';

describe('Part Controller', () => {
  let controller: PartController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartController],
    }).compile();

    controller = module.get<PartController>(PartController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
