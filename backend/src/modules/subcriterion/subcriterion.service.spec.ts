import { Test, TestingModule } from '@nestjs/testing';
import { SubCriterionService } from './subcriterion.service';

describe('SubCriterionService', () => {
  let service: SubCriterionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubCriterionService],
    }).compile();

    service = module.get<SubCriterionService>(SubCriterionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
