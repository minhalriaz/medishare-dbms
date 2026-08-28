import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class ReportsService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}
// 1. INNER JOIN + COUNT + SUM Total quantity + GROUP BY
// Donation summary with organization and item totals.
  donationSummary() {
    return this.dataSource.query(`
      SELECT d.donation_id, o.organization_name, d.donation_date,
             d.donation_status, COUNT(di.donation_item_id) AS total_items,
             SUM(di.quantity) AS total_quantity 
      FROM dbo.donation AS d
      INNER JOIN dbo.donation_item AS di ON d.donation_id = di.donation_id
      INNER JOIN dbo.organization AS o ON d.receiving_organization_id = o.organization_id
      GROUP BY d.donation_id, o.organization_name, d.donation_date, d.donation_status
      ORDER BY d.donation_id;
    `);
  }

  // 2. RIGHT JOIN + COUNT + SUM + GROUP BY
// Shows all medicines and their donation totals.

  medicineContribution() {
    return this.dataSource.query(`
      SELECT m.medicine_id, m.medicine_name,
             COUNT(di.donation_item_id) AS donation_items,
             COALESCE(SUM(di.quantity), 0) AS total_quantity
      FROM dbo.donation_item AS di
      RIGHT JOIN dbo.medicine AS m ON di.medicine_id = m.medicine_id
      GROUP BY m.medicine_id, m.medicine_name
      ORDER BY total_quantity DESC, m.medicine_name;
    `);
  }

  // 3. LEFT JOIN + COUNT + GROUP BY
// Shows donation activity for every organization.

  organizationActivity() {
    return this.dataSource.query(`
      SELECT o.organization_id, o.organization_name,
             COUNT(d.donation_id) AS donation_count
      FROM dbo.organization AS o
      LEFT JOIN dbo.donation AS d ON o.organization_id = d.receiving_organization_id
      GROUP BY o.organization_id, o.organization_name
      ORDER BY donation_count DESC, o.organization_name;
    `);
  }
// 4. LEFT JOIN
// Finds donations without any items.
  donationsNeedingAttention() {
    return this.dataSource.query(`
      SELECT d.donation_id, d.donation_date, d.donation_status
      FROM dbo.donation AS d
      LEFT JOIN dbo.donation_item AS di ON d.donation_id = di.donation_id
      WHERE di.donation_item_id IS NULL
      ORDER BY d.donation_id;
    `);
  }

  // 5. INNER JOIN + SUM + GROUP BY + HAVING
// Finds donations with quantity greater than 5.

  highVolumeDonations() {
    return this.dataSource.query(`
      SELECT d.donation_id, o.organization_name,
             SUM(di.quantity) AS total_quantity
      FROM dbo.donation AS d
      INNER JOIN dbo.donation_item AS di ON d.donation_id = di.donation_id
      INNER JOIN dbo.organization AS o ON d.receiving_organization_id = o.organization_id
      GROUP BY d.donation_id, o.organization_name
      HAVING SUM(di.quantity) > 5
      ORDER BY d.donation_id;
    `);
  }

  // 6. SUBQUERY + SUM + GROUP BY + HAVING + AVG
// Finds donations above the average total quantity.

  async donationInsights() {
    const [aboveAverageDonations, quantityStats] = await Promise.all([
      this.dataSource.query(`
        SELECT donation_id, SUM(quantity) AS total_quantity
        FROM dbo.donation_item
        GROUP BY donation_id
        HAVING SUM(quantity) > (
          SELECT AVG(total_quantity)
          FROM (
            SELECT donation_id, SUM(quantity) AS total_quantity
            FROM dbo.donation_item
            GROUP BY donation_id
          ) AS donation_totals
        )
        ORDER BY donation_id;
      `),
      this.dataSource.query(`
        SELECT AVG(CAST(quantity AS DECIMAL(10,2))) AS average_quantity
        FROM dbo.donation_item;
      `),
    ]);

    return { aboveAverageDonations, quantityStats };
  }
}
