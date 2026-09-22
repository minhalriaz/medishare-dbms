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
  // READ AUDIT HISTORY
  // ==========================================

  async getAuditHistory(medicineId?: number) {
    if (
      medicineId !== undefined &&
      (Number.isNaN(medicineId) || !Number.isInteger(medicineId) || medicineId < 1)
    ) {
      throw new BadRequestException('Medicine ID must be a valid positive integer');
    }

    const params: any[] = [];
    let query = `
      SELECT
        audit_id,
        medicine_id,
        action_type,
        changed_at,
        changed_by,
        medicine_name_old,
        medicine_name_new,
        generic_name_old,
        generic_name_new,
        manufacturer_old,
        manufacturer_new,
        dosage_form_old,
        dosage_form_new,
        strength_old,
        strength_new,
        medicine_category_old,
        medicine_category_new,
        prescription_required_old,
        prescription_required_new
      FROM dbo.medicine_audit
    `;

    if (medicineId !== undefined) {
      query += ` WHERE medicine_id = @0`;
      params.push(medicineId);
    }

    query += ` ORDER BY changed_at DESC, audit_id DESC`;

    return await this.dataSource.query(query, params);
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
