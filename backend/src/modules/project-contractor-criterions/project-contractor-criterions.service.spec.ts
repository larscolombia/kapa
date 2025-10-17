import { Test, TestingModule } from '@nestjs/testing';
import { ProjectContractorCriterionsService } from './project-contractor-criterions.service';

describe('ProjectContractorCriterionsService', () => {
  let service: ProjectContractorCriterionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectContractorCriterionsService],
    }).compile();

    service = module.get<ProjectContractorCriterionsService>(ProjectContractorCriterionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
