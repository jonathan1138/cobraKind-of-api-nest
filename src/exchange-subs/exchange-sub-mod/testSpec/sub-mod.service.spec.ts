import { Test, TestingModule } from '@nestjs/testing';
import { SubModService } from '../sub-mod.service';

describe('SubModService', () => {
  let service: SubModService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubModService],
    }).compile();

    service = module.get<SubModService>(SubModService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
