import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { DatabaseService } from '../database/database.service';
import { CreateDistributionItemDto } from './dto/create-distribution-item.dto';
import { UpdateDistributionItemDto } from './dto/update-distribution-item.dto';

@Injectable()
export class DistributionItemService {
  constructor(private readonly database: DatabaseService) {}

  private readonly details = `SELECT di.distribution_item_id, di.distribution_id, di.inventory_id,
    di.distributed_quantity, d.request_id, d.distribution_status,
    i.organization_id, i.available_quantity, m.medicine_name, m.strength, donated.batch_number
    FROM distribution_item di
    JOIN distribution d ON d.distribution_id = di.distribution_id
    JOIN inventory i ON i.inventory_id = di.inventory_id
    JOIN donation_item donated ON donated.donation_item_id = i.donation_item_id
    JOIN medicine m ON m.medicine_id = donated.medicine_id`;

  all() { return this.database.query(`${this.details} ORDER BY di.distribution_item_id DESC`); }
  async one(id: number) {
    const rows = await this.database.query(`${this.details} WHERE di.distribution_item_id = @0`, [id]);
    if (!rows.length) throw new NotFoundException(`Distribution item ${id} not found`);
    return rows[0];
  }
  async options() {
    const [distributions, inventory] = await Promise.all([
      this.database.query('SELECT distribution_id, request_id, distributed_by_organization_id FROM distribution ORDER BY distribution_id DESC'),
      this.database.query(`SELECT i.inventory_id, i.organization_id, i.available_quantity, m.medicine_name, m.strength, di.batch_number
        FROM inventory i JOIN donation_item di ON di.donation_item_id = i.donation_item_id
        JOIN medicine m ON m.medicine_id = di.medicine_id ORDER BY i.inventory_id DESC`),
    ]);
    return { distributions, inventory };
  }

  // The inventory row lock makes concurrent stock checks and deductions atomic.
  private async allocate(manager: EntityManager, distributionId: number, inventoryId: number, quantity: number, excludeId = 0) {
    const distributions = await manager.query('SELECT request_id, distributed_by_organization_id FROM distribution WITH (UPDLOCK, HOLDLOCK) WHERE distribution_id = @0', [distributionId]);
    if (!distributions.length) throw new BadRequestException('Distribution does not exist');
    const stocks = await manager.query(`SELECT i.available_quantity, i.received_quantity, i.organization_id, donated.medicine_id
      FROM inventory i WITH (UPDLOCK, HOLDLOCK)
      JOIN donation_item donated ON donated.donation_item_id = i.donation_item_id
      WHERE i.inventory_id = @0`, [inventoryId]);
    if (!stocks.length) throw new BadRequestException('Inventory does not exist');
    const stock = stocks[0];
    if (stock.organization_id !== distributions[0].distributed_by_organization_id)
      throw new BadRequestException('Inventory must belong to the distributing organization');
    const requested = await manager.query(`SELECT COALESCE(SUM(quantity), 0) AS requested_quantity
      FROM request_item WHERE request_id = @0 AND medicine_id = @1`, [distributions[0].request_id, stock.medicine_id]);
    if (Number(requested[0].requested_quantity) === 0)
      throw new BadRequestException('This medicine is not in the distribution request');
    const already = await manager.query(`SELECT COALESCE(SUM(di.distributed_quantity), 0) AS allocated
      FROM distribution_item di JOIN distribution d ON d.distribution_id = di.distribution_id
      JOIN inventory i ON i.inventory_id = di.inventory_id
      JOIN donation_item donated ON donated.donation_item_id = i.donation_item_id
      WHERE d.request_id = @0 AND donated.medicine_id = @1 AND di.distribution_item_id <> @2`, [distributions[0].request_id, stock.medicine_id, excludeId]);
    if (Number(already[0].allocated) + quantity > Number(requested[0].requested_quantity))
      throw new BadRequestException('Quantity exceeds the remaining requested quantity');
    if (Number(stock.available_quantity) < quantity)
      throw new BadRequestException('Insufficient inventory quantity');
    await manager.query(`UPDATE inventory SET available_quantity = available_quantity - @0,
      inventory_status = CASE WHEN available_quantity - @0 = 0 THEN 'Out of Stock'
        WHEN available_quantity - @0 < received_quantity * 0.2 THEN 'Low Stock' ELSE 'Available' END
      WHERE inventory_id = @1`, [quantity, inventoryId]);
  }
  private async restore(manager: EntityManager, inventoryId: number, quantity: number) {
    await manager.query(`UPDATE inventory SET available_quantity = available_quantity + @0,
      inventory_status = CASE WHEN available_quantity + @0 = 0 THEN 'Out of Stock'
        WHEN available_quantity + @0 < received_quantity * 0.2 THEN 'Low Stock' ELSE 'Available' END
      WHERE inventory_id = @1`, [quantity, inventoryId]);
  }
  async create(dto: CreateDistributionItemDto) {
    const id = await this.database.transaction(async manager => {
      await this.allocate(manager, dto.distribution_id, dto.inventory_id, dto.distributed_quantity);
      const rows = await manager.query(`INSERT INTO distribution_item (distribution_id, inventory_id, distributed_quantity)
        OUTPUT inserted.distribution_item_id VALUES (@0, @1, @2)`, [dto.distribution_id, dto.inventory_id, dto.distributed_quantity]);
      return rows[0].distribution_item_id as number;
    });
    return this.one(id);
  }
  async update(id: number, dto: UpdateDistributionItemDto) {
    await this.database.transaction(async manager => {
      const rows = await manager.query('SELECT * FROM distribution_item WITH (UPDLOCK, HOLDLOCK) WHERE distribution_item_id = @0', [id]);
      if (!rows.length) throw new NotFoundException(`Distribution item ${id} not found`);
      const old = rows[0];
      const distributionId = dto.distribution_id ?? old.distribution_id;
      const inventoryId = dto.inventory_id ?? old.inventory_id;
      const quantity = dto.distributed_quantity ?? old.distributed_quantity;
      await this.restore(manager, old.inventory_id, old.distributed_quantity);
      await this.allocate(manager, distributionId, inventoryId, quantity, id);
      await manager.query('UPDATE distribution_item SET distribution_id = @0, inventory_id = @1, distributed_quantity = @2 WHERE distribution_item_id = @3', [distributionId, inventoryId, quantity, id]);
    });
    return this.one(id);
  }
  async remove(id: number) {
    await this.database.transaction(async manager => {
      const rows = await manager.query('SELECT * FROM distribution_item WITH (UPDLOCK, HOLDLOCK) WHERE distribution_item_id = @0', [id]);
      if (!rows.length) throw new NotFoundException(`Distribution item ${id} not found`);
      await manager.query('DELETE FROM distribution_item WHERE distribution_item_id = @0', [id]);
      await this.restore(manager, rows[0].inventory_id, rows[0].distributed_quantity);
    });
    return { message: `Distribution item ${id} deleted` };
  }
}
