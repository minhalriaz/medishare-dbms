import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';

@Injectable()
export class DonationsService {
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

  private async insertDonationItems(
    manager: any,
    donationId: number,
    donationItems: any[] = [],
  ) {
    if (!Array.isArray(donationItems) || donationItems.length === 0) {
      return;
    }

    for (const item of donationItems) {
      await this.assertMedicineExists(manager, item.medicine_id);
      await manager.query(
        `INSERT INTO donation_item (
          donation_id,
          medicine_id,
          batch_number,
          quantity,
          manufacturing_date,
          expiry_date,
          packaging_condition,
          storage_condition
        ) VALUES (@0, @1, @2, @3, @4, @5, @6, @7)`,
        [
          donationId,
          item.medicine_id,
          item.batch_number,
          item.quantity,
          item.manufacturing_date,
          item.expiry_date,
          item.packaging_condition,
          item.storage_condition,
        ],
      );
    }
  }

  private async getDonationItems(donationId: number, manager: any = this.dataSource) {
    return manager.query(
      `SELECT
        di.donation_item_id,
        di.donation_id,
        di.medicine_id,
        di.batch_number,
        di.quantity,
        di.manufacturing_date,
        di.expiry_date,
        di.packaging_condition,
        di.storage_condition,
        m.medicine_name,
        m.generic_name,
        m.manufacturer,
        m.dosage_form,
        m.strength,
        m.medicine_category,
        m.prescription_required
      FROM donation_item di
      LEFT JOIN medicine m ON di.medicine_id = m.medicine_id
      WHERE di.donation_id = @0
      ORDER BY di.donation_item_id`,
      [donationId],
    );
  }

  private async mapDonation(row: any, items: any[] = []) {
    return {
      donation_id: row.donation_id,
      donor_user_id: row.donor_user_id,
      receiving_organization_id: row.receiving_organization_id,
      donation_date: row.donation_date,
      donation_status: row.donation_status,
      donor_note: row.donor_note,
      donation_items: items,
    };
  }

  async create(createDonationDto: CreateDonationDto) {
    const { donation_items, ...donationFields } = createDonationDto;

    return this.dataSource.transaction(async (manager) => {
      const donationIdRows = await manager.query(
        `INSERT INTO donation (
          donor_user_id,
          receiving_organization_id,
          donation_date,
          donation_status,
          donor_note
        )
        OUTPUT inserted.donation_id AS donation_id
        VALUES (@0, @1, @2, @3, @4)`,
        [
          donationFields.donor_user_id,
          donationFields.receiving_organization_id,
          donationFields.donation_date,
          donationFields.donation_status,
          donationFields.donor_note ?? null,
        ],
      );

      const createdDonationId = Number(donationIdRows?.[0]?.donation_id);
      await this.insertDonationItems(manager, createdDonationId, donation_items || []);

      const donationRows = await manager.query(
        'SELECT * FROM donation WHERE donation_id = @0',
        [createdDonationId],
      );

      const donation = donationRows[0];
      donation.donation_items = await this.getDonationItems(createdDonationId, manager);

      return donation;
    });
  }

  async findAll() {
    const donations = await this.dataSource.query(
      'SELECT * FROM donation ORDER BY donation_id',
    );

    if (!donations.length) {
      return [];
    }

    const ids = donations.map((d: any) => d.donation_id);
    const items = await this.dataSource.query(
      `SELECT
        di.donation_item_id,
        di.donation_id,
        di.medicine_id,
        di.batch_number,
        di.quantity,
        di.manufacturing_date,
        di.expiry_date,
        di.packaging_condition,
        di.storage_condition,
        m.medicine_name,
        m.generic_name,
        m.manufacturer,
        m.dosage_form,
        m.strength,
        m.medicine_category,
        m.prescription_required
      FROM donation_item di
      LEFT JOIN medicine m ON di.medicine_id = m.medicine_id
      WHERE di.donation_id IN (${ids.map((_: any, index: number) => `@${index}`).join(', ')})
      ORDER BY di.donation_item_id`,
      ids,
    );

    const itemMap: Record<number, any[]> = {};
    for (const item of items) {
      itemMap[item.donation_id] = itemMap[item.donation_id] || [];
      itemMap[item.donation_id].push(item);
    }

    return donations.map((donation: any) => ({
      ...donation,
      donation_items: itemMap[donation.donation_id] || [],
    }));
  }

  async findOne(id: number) {
    const donationRows = await this.dataSource.query(
      'SELECT * FROM donation WHERE donation_id = @0',
      [id],
    );

    if (!donationRows?.length) {
      throw new NotFoundException(`Donation with ID ${id} not found`);
    }

    const donation = donationRows[0];
    donation.donation_items = await this.getDonationItems(id);

    return donation;
  }

  async update(id: number, updateDonationDto: UpdateDonationDto) {
    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.query(
        'SELECT TOP 1 donation_id FROM donation WHERE donation_id = @0',
        [id],
      );

      if (!existing?.length) {
        throw new NotFoundException(`Donation with ID ${id} not found`);
      }

      const { donation_items, ...donationFields } = updateDonationDto;

      const setClauses: string[] = [];
      const params: any[] = [];

      for (const [key, value] of Object.entries(donationFields)) {
        if (value !== undefined) {
          setClauses.push(`${key} = @${params.length}`);
          params.push(value);
        }
      }

      if (setClauses.length > 0) {
        params.push(id);
        await manager.query(
          `UPDATE donation SET ${setClauses.join(', ')} WHERE donation_id = @${params.length - 1}`,
          params,
        );
      }

      if (Array.isArray(donation_items)) {
        await manager.query(
          'DELETE FROM donation_item WHERE donation_id = @0',
          [id],
        );
        await this.insertDonationItems(manager, id, donation_items);
      }

      const donationRows = await manager.query(
        'SELECT * FROM donation WHERE donation_id = @0',
        [id],
      );
      const donation = donationRows[0];
      donation.donation_items = await this.getDonationItems(id, manager);

      return donation;
    });
  }

  async remove(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.query(
        'SELECT TOP 1 donation_id FROM donation WHERE donation_id = @0',
        [id],
      );

      if (!existing?.length) {
        throw new NotFoundException(`Donation with ID ${id} not found`);
      }

      await manager.query('DELETE FROM donation_item WHERE donation_id = @0', [id]);
      await manager.query('DELETE FROM donation WHERE donation_id = @0', [id]);

      return { message: `Donation with ID ${id} deleted successfully` };
    });
  }
}
