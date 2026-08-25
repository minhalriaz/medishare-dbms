import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DonationsService } from './donations.service';

describe('DonationsService', () => {
  let service: DonationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationsService,
        {
          provide: getDataSourceToken(),
          useValue: {
            options: { type: 'mssql' },
            query: jest.fn(),
            transaction: jest.fn(),
            manager: { query: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<DonationsService>(DonationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
