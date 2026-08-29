import { Test, TestingModule } from '@nestjs/testing';
import { MedicineRequestController } from './medicine-request.controller';
import { MedicineRequestService } from './medicine-request.service';

describe('MedicineRequestController', () => {
  let controller: MedicineRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicineRequestController],
      providers: [
        {
          provide: MedicineRequestService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MedicineRequestController>(MedicineRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
