import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async summary() {
    const totalRes = await this.dataSource.query('SELECT COUNT(*) AS total_donations FROM dbo.donation');
    const pendingRes = await this.dataSource.query("SELECT COUNT(*) AS pending_donations FROM dbo.donation WHERE donation_status = 'Pending'");
    const completedRes = await this.dataSource.query("SELECT COUNT(*) AS completed_donations FROM dbo.donation WHERE donation_status = 'Completed'");
    const inventoryRes = await this.dataSource.query('SELECT SUM(quantity) AS total_inventory_items FROM dbo.inventory');
    const nearExpiry = await this.dataSource.query('SELECT * FROM dbo.inventory WHERE expiry_date <= DATEADD(day, 90, CAST(GETDATE() AS date))');

    return {
      total_donations: totalRes && totalRes[0] ? totalRes[0].total_donations : 0,
      pending_donations: pendingRes && pendingRes[0] ? pendingRes[0].pending_donations : 0,
      completed_donations: completedRes && completedRes[0] ? completedRes[0].completed_donations : 0,
      total_inventory_items: inventoryRes && inventoryRes[0] ? inventoryRes[0].total_inventory_items : 0,
      near_expiry: nearExpiry || [],
    };
  }
}
