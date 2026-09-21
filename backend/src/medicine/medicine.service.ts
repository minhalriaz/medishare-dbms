import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { Medicine } from './entities/medicine.entity';

@Injectable()
export class MedicineService {
  constructor(
    @InjectRepository(Medicine)
    private readonly medicineRepository: Repository<Medicine>,

    private readonly dataSource: DataSource,
  ) {}

  // ==========================================
  // CREATE
  // ==========================================

  async create(createMedicineDto: CreateMedicineDto) {
    const medicine = this.medicineRepository.create(createMedicineDto);

    return await this.medicineRepository.save(medicine);
  }

  // ==========================================
  // READ ALL
  // ==========================================

  async findAll() {
    return await this.medicineRepository.find({
      order: {
        medicine_id: 'ASC',
      },
    });
  }

  // ==========================================
  // READ ONE
  // ==========================================

  async findOne(id: number) {
    const medicine = await this.medicineRepository.findOneBy({
      medicine_id: id,
    });

    if (!medicine) {
      throw new NotFoundException(`Medicine with ID ${id} not found`);
    }

    return medicine;
  }

  // ==========================================
  // UPDATE
  // ==========================================

  async update(id: number, updateMedicineDto: UpdateMedicineDto) {
    const medicine = await this.findOne(id);

    Object.assign(medicine, updateMedicineDto);

    return await this.medicineRepository.save(medicine);
  }

  // ==========================================
  // DELETE
  // ==========================================

  async remove(id: number) {
    const medicine = await this.findOne(id);

    const references = await this.dataSource.query(
      `
      SELECT COUNT(*) AS total_refs
      FROM (
        SELECT medicine_id
        FROM donation_item
        WHERE medicine_id = @0
        UNION ALL
        SELECT medicine_id
        FROM request_item
        WHERE medicine_id = @0
      ) AS related_items
      `,
      [id],
    );

    if (Number(references?.[0]?.total_refs ?? 0) > 0) {
      throw new BadRequestException(
        `Cannot delete Medicine with ID ${id} because it is referenced by donation_item or request_item records. Remove or update those records first.`,
      );
    }

    await this.medicineRepository.remove(medicine);

    return {
      message: `Medicine with ID ${id} deleted successfully`,
    };
  }
}
