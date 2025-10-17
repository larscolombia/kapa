import { Test, TestingModule } from '@nestjs/testing';
import { ProjectContractorsService } from './project-contractors.service';

describe('ProjectContractorsService', () => {
  let service: ProjectContractorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectContractorsService],
    }).compile();

    service = module.get<ProjectContractorsService>(ProjectContractorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
