import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateMedicineRequestDto } from './dto/create-medicine-request.dto';
import { UpdateMedicineRequestDto } from './dto/update-medicine-request.dto';

@Injectable()
export class MedicineRequestService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  private async assertMedicineExists(manager: any, medicineId: number) {
    const rows = await manager.query(
      'SELECT TOP 1 medicine_id FROM medicine WHERE medicine_id = @0',
      [medicineId],
    );

    if (!rows?.length) {
      throw new BadRequestException(`Medicine ${medicineId} does not exist`);
    }
  }

  private async insertRequestItems(
    manager: any,
    requestId: number,
    requestItems: any[] = [],
  ) {
    if (!Array.isArray(requestItems) || requestItems.length === 0) {
      return;
    }

    for (const item of requestItems) {
      await this.assertMedicineExists(manager, item.medicine_id);
      await manager.query(
        `INSERT INTO request_item (
          request_id,
          medicine_id,
          quantity,
          notes
        ) VALUES (@0, @1, @2, @3)`,
        [
          requestId,
          item.medicine_id,
          item.quantity,
          item.notes ?? null,
        ],
      );
    }
  }

  private async getRequestItems(requestId: number, manager: any = this.dataSource) {
    return manager.query(
      `SELECT
        ri.request_item_id,
        ri.request_id,
        ri.medicine_id,
        ri.quantity,
        ri.notes,
        m.medicine_name,
        m.generic_name,
        m.manufacturer,
        m.dosage_form,
        m.strength
      FROM request_item ri
      LEFT JOIN medicine m ON ri.medicine_id = m.medicine_id
      WHERE ri.request_id = @0
      ORDER BY ri.request_item_id`,
      [requestId],
    );
  }

  private async hydrateRequestData(request: any, manager: any = this.dataSource) {
    const requestId = Number(request?.request_id ?? request?.id);
    if (!requestId) {
      return request;
    }

    const requestRows = await manager.query(
      `SELECT 
        r.request_id,
        r.requester_user_id,
        r.requested_from_organization_id,
        r.priority_level,
        r.reason,
        r.request_status,
        r.request_date,
        o.organization_name AS requested_from_org,
        u.full_name AS requester_name,
        COALESCE((SELECT SUM(ri.quantity) FROM request_item ri WHERE ri.request_id = r.request_id), 0) AS total_requested_items
      FROM medicine_request r
      INNER JOIN organization o ON r.requested_from_organization_id = o.organization_id
      INNER JOIN [user] u ON r.requester_user_id = u.user_id
      WHERE r.request_id = @0`,
      [requestId],
    );

    const hydrated = requestRows?.[0] || request;
    hydrated.request_items = await this.getRequestItems(requestId, manager);

    return hydrated;
  }

  async create(createMedicineRequestDto: CreateMedicineRequestDto) {
    const { request_items, ...requestFields } = createMedicineRequestDto;

    return this.dataSource.transaction(async (manager) => {
      const requestIdRows = await manager.query(
        `INSERT INTO medicine_request (
          requester_user_id,
          requested_from_organization_id,
          priority_level,
          reason,
          request_status,
          request_date
        )
        OUTPUT inserted.request_id AS request_id
        VALUES (@0, @1, @2, @3, @4, @5)`,
        [
          requestFields.requester_user_id,
          requestFields.requested_from_organization_id,
          requestFields.priority_level,
          requestFields.reason,
          requestFields.request_status ?? 'Pending',
          requestFields.request_date ?? new Date(),
        ],
      );

      const createdRequestId = Number(requestIdRows?.[0]?.request_id);
      await this.insertRequestItems(manager, createdRequestId, request_items || []);

      const requestRows = await manager.query(
        'SELECT * FROM medicine_request WHERE request_id = @0',
        [createdRequestId],
      );

      return this.hydrateRequestData(requestRows[0], manager);
    });
  }

  async findAll() {
    const requests = await this.dataSource.query(
      `SELECT 
        r.request_id,
        r.request_status,
        r.priority_level,
        r.reason,
        r.request_date,
        o.organization_name AS requested_from_org,
        u.full_name AS requester_name,
        COALESCE((SELECT SUM(ri.quantity) FROM request_item ri WHERE ri.request_id = r.request_id), 0) AS total_requested_items
      FROM medicine_request r
      INNER JOIN organization o ON r.requested_from_organization_id = o.organization_id
      INNER JOIN [user] u ON r.requester_user_id = u.user_id
      ORDER BY r.request_id DESC`,
    );

    if (!requests.length) {
      return [];
    }

    const ids = requests.map((r: any) => r.request_id);
    const items = await this.dataSource.query(
      `SELECT
        ri.request_item_id,
        ri.request_id,
        ri.medicine_id,
        ri.quantity,
        ri.notes,
        m.medicine_name,
        m.generic_name,
        m.manufacturer,
        m.dosage_form,
        m.strength
      FROM request_item ri
      LEFT JOIN medicine m ON ri.medicine_id = m.medicine_id
      WHERE ri.request_id IN (${ids.map((_: any, index: number) => `@${index}`).join(', ')})
      ORDER BY ri.request_item_id`,
      ids,
    );

    const itemMap: Record<number, any[]> = {};
    for (const item of items) {
      itemMap[item.request_id] = itemMap[item.request_id] || [];
      itemMap[item.request_id].push(item);
    }

    return requests.map((request: any) => ({
      ...request,
      request_items: itemMap[request.request_id] || [],
    }));
  }

  async findOne(id: number) {
    const requestRows = await this.dataSource.query(
      `SELECT 
        r.request_id,
        r.request_status,
        r.priority_level,
        r.reason,
        r.request_date,
        o.organization_name AS requested_from_org,
        u.full_name AS requester_name,
        COALESCE((SELECT SUM(ri.quantity) FROM request_item ri WHERE ri.request_id = r.request_id), 0) AS total_requested_items
      FROM medicine_request r
      INNER JOIN organization o ON r.requested_from_organization_id = o.organization_id
      INNER JOIN [user] u ON r.requester_user_id = u.user_id
      WHERE r.request_id = @0`,
      [id],
    );

    if (!requestRows?.length) {
      throw new NotFoundException(`Medicine request with ID ${id} not found`);
    }

    const request = requestRows[0];
    request.request_items = await this.getRequestItems(id);

    return request;
  }

  async update(id: number, updateMedicineRequestDto: UpdateMedicineRequestDto) {
    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.query(
        'SELECT TOP 1 request_id FROM medicine_request WHERE request_id = @0',
        [id],
      );

      if (!existing?.length) {
        throw new NotFoundException(`Medicine request with ID ${id} not found`);
      }

      const { request_items, ...requestFields } = updateMedicineRequestDto;

      const setClauses: string[] = [];
      const params: any[] = [];

      for (const [key, value] of Object.entries(requestFields)) {
        if (value !== undefined) {
          setClauses.push(`${key} = @${params.length}`);
          params.push(value);
        }
      }

      if (setClauses.length > 0) {
        params.push(id);
        await manager.query(
          `UPDATE medicine_request SET ${setClauses.join(', ')} WHERE request_id = @${params.length - 1}`,
          params,
        );
      }

      if (Array.isArray(request_items)) {
        await manager.query('DELETE FROM request_item WHERE request_id = @0', [id]);
        await this.insertRequestItems(manager, id, request_items);
      }

      const requestRows = await manager.query(
        'SELECT * FROM medicine_request WHERE request_id = @0',
        [id],
      );

      return this.hydrateRequestData(requestRows[0], manager);
    });
  }

  async remove(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.query(
        'SELECT TOP 1 request_id FROM medicine_request WHERE request_id = @0',
        [id],
      );

      if (!existing?.length) {
        throw new NotFoundException(`Medicine request with ID ${id} not found`);
      }

      await manager.query('DELETE FROM request_item WHERE request_id = @0', [id]);
      await manager.query('DELETE FROM medicine_request WHERE request_id = @0', [id]);

      return { message: `Medicine request with ID ${id} deleted successfully` };
    });
  }
}
