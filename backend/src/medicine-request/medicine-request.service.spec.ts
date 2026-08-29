import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { MedicineRequestService } from './medicine-request.service';

describe('MedicineRequestService', () => {
  let service: MedicineRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicineRequestService,
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

    service = module.get<MedicineRequestService>(MedicineRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
