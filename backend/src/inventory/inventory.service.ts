import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // CREATE
  async create(createInventoryDto: CreateInventoryDto) {
    const { medicine_name, batch_number, quantity, expiry_date, status } = createInventoryDto as any;

    const result = await this.dataSource.query(
      `INSERT INTO inventory (medicine_name, batch_number, quantity, expiry_date, status)
       OUTPUT inserted.id AS id
       VALUES (?, ?, ?, ?, ?)`,
      [medicine_name, batch_number, quantity, expiry_date, status ?? 'Available'],
    );

    const id = result && result[0] && result[0].id;

    const rows = await this.dataSource.query('SELECT * FROM inventory WHERE id = ?', [id]);
    return rows[0];
  }

  // READ ALL
  async findAll() {
    return await this.dataSource.query('SELECT * FROM inventory');
  }

  // READ ONE
  async findOne(id: number) {
    const rows = await this.dataSource.query('SELECT * FROM inventory WHERE id = ?', [id]);

    if (!rows || !rows[0]) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    return rows[0];
  }

  // UPDATE
  async update(id: number, updateInventoryDto: UpdateInventoryDto) {
    const existing = await this.dataSource.query('SELECT * FROM inventory WHERE id = ?', [id]);
    if (!existing || !existing[0]) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    const setClauses: string[] = [];
    const params: any[] = [];

    for (const [key, value] of Object.entries(updateInventoryDto as any)) {
      if (value !== undefined) {
        setClauses.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (setClauses.length > 0) {
      params.push(id);
      await this.dataSource.query(`UPDATE inventory SET ${setClauses.join(', ')} WHERE id = ?`, params);
    }

    const rows = await this.dataSource.query('SELECT * FROM inventory WHERE id = ?', [id]);
    return rows[0];
  }

  // DELETE
  async remove(id: number) {
    const existing = await this.dataSource.query('SELECT * FROM inventory WHERE id = ?', [id]);
    if (!existing || !existing[0]) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    await this.dataSource.query('DELETE FROM inventory WHERE id = ?', [id]);

    return {
      message: `Inventory with ID ${id} deleted successfully`,
    };
  }
}