import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../database/database.service';
import { DistributionService } from './distribution.service';

describe('DistributionService', () => {
  let service: DistributionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistributionService,
        {
          provide: DatabaseService,
          useValue: {
            query: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DistributionService>(DistributionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
