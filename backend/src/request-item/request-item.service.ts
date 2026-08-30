import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateRequestItemDto } from './dto/create-request-item.dto';
import { UpdateRequestItemDto } from './dto/update-request-item.dto';

@Injectable()
export class RequestItemService {
  constructor(private readonly database: DatabaseService) {}

  private readonly selectSql = `
    SELECT
      ri.request_item_id,
      ri.request_id,
      ri.medicine_id,
      ri.quantity,
      ri.notes,
      mr.request_status,
      mr.priority_level,
      m.medicine_name,
      m.generic_name,
      m.manufacturer,
      m.dosage_form,
      m.strength
    FROM request_item AS ri
    INNER JOIN medicine_request AS mr ON mr.request_id = ri.request_id
    INNER JOIN medicine AS m ON m.medicine_id = ri.medicine_id`;

  private async validateForeignKeys(requestId: number, medicineId: number) {
    const requests = await this.database.query(
      'SELECT TOP 1 request_id FROM medicine_request WHERE request_id = @0',
      [requestId],
    );
    if (!requests.length) throw new BadRequestException(`Medicine request ID ${requestId} does not exist`);

    const medicines = await this.database.query(
      'SELECT TOP 1 medicine_id FROM medicine WHERE medicine_id = @0',
      [medicineId],
    );
    if (!medicines.length) throw new BadRequestException(`Medicine ID ${medicineId} does not exist`);
  }

  async create(dto: CreateRequestItemDto) {
    await this.validateForeignKeys(dto.request_id, dto.medicine_id);
    const rows = await this.database.query(
      `INSERT INTO request_item (request_id, medicine_id, quantity, notes)
       OUTPUT inserted.request_item_id
       VALUES (@0, @1, @2, @3)`,
      [dto.request_id, dto.medicine_id, dto.quantity, dto.notes?.trim() || null],
    );
    return this.findOne(rows[0].request_item_id);
  }

  findAll() {
    return this.database.query(`${this.selectSql} ORDER BY ri.request_item_id DESC`);
  }

  async getFormOptions() {
    const [requests, medicines] = await Promise.all([
      this.database.query(
        `SELECT request_id, request_status, priority_level
         FROM medicine_request
         ORDER BY request_id DESC`,
      ),
      this.database.query(
        `SELECT medicine_id, medicine_name, generic_name, strength, dosage_form
         FROM medicine
         ORDER BY medicine_name ASC`,
      ),
    ]);

    return { requests, medicines };
  }

  async findOne(id: number) {
    const rows = await this.database.query(
      `${this.selectSql} WHERE ri.request_item_id = @0`,
      [id],
    );
    if (!rows.length) throw new NotFoundException(`Request item ID ${id} not found`);
    return rows[0];
  }

  async update(id: number, dto: UpdateRequestItemDto) {
    const current = await this.findOne(id);
    const requestId = dto.request_id ?? current.request_id;
    const medicineId = dto.medicine_id ?? current.medicine_id;
    await this.validateForeignKeys(requestId, medicineId);

    await this.database.query(
      `UPDATE request_item
       SET request_id = @0, medicine_id = @1, quantity = @2, notes = @3
       WHERE request_item_id = @4`,
      [
        requestId,
        medicineId,
        dto.quantity ?? current.quantity,
        dto.notes === undefined ? current.notes : dto.notes.trim() || null,
        id,
      ],
    );
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.database.query('DELETE FROM request_item WHERE request_item_id = @0', [id]);
    return { message: `Request item ID ${id} deleted successfully` };
  }
}
