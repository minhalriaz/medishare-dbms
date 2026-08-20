import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class OrganizationsService {
  constructor(private readonly databaseService: DatabaseService) {}

  // =====================================================
  // FEATURE 1: Organization Directory
  // SQL Concept: INNER JOIN
  // =====================================================
  async getOrganizationDirectory() {
    const sql = `
      SELECT
        o.organization_id,
        o.organization_name,
        o.organization_type,
        o.licence_number,
        o.organization_address,
        o.verification_status,
        u.user_id,
        u.full_name AS representative_name,
        u.email AS representative_email,
        u.phone AS representative_phone
      FROM organization o
      INNER JOIN \`user\` u
        ON o.user_id = u.user_id
      ORDER BY o.organization_name ASC;
    `;

    return this.databaseService.query(sql);
  }

  // =====================================================
  // FEATURE 2: Organization Inventory Overview
  // SQL Concept: LEFT OUTER JOIN
  // =====================================================
  async getOrganizationInventoryOverview() {
    const sql = `
      SELECT
        o.organization_id,
        o.organization_name,
        o.organization_type,
        i.inventory_id,
        i.received_quantity,
        i.available_quantity,
        i.storage_location,
        i.inventory_status
      FROM organization o
      LEFT OUTER JOIN inventory i
        ON o.organization_id = i.organization_id
      ORDER BY
        o.organization_id,
        i.inventory_id;
    `;

    return this.databaseService.query(sql);
  }
    // =====================================================
  // FEATURE 3: Detailed Medicine Inventory
  // SQL Concept: 4-TABLE INNER JOIN
  // Organization -> Inventory -> Donation Item -> Medicine
  // =====================================================
  async getDetailedMedicineInventory() {
    const sql = `
      SELECT
        o.organization_id,
        o.organization_name,
        o.organization_type,

        i.inventory_id,
        i.received_quantity,
        i.available_quantity,
        i.storage_location,
        i.inventory_status,

        di.donation_item_id,
        di.batch_number,
        di.manufacturing_date,
        di.expiry_date,

        m.medicine_id,
        m.medicine_name,
        m.generic_name,
        m.manufacturer,
        m.dosage_form,
        m.strength

      FROM organization o

      INNER JOIN inventory i
        ON o.organization_id = i.organization_id

      INNER JOIN donation_item di
        ON i.donation_item_id = di.donation_item_id

      INNER JOIN medicine m
        ON di.medicine_id = m.medicine_id

      ORDER BY
        o.organization_name ASC,
        m.medicine_name ASC;
    `;

    return this.databaseService.query(sql);
  }
    // =====================================================
  // FEATURE 4: Organization Statistics Dashboard
  // SQL Concepts:
  // LEFT OUTER JOIN
  // COUNT
  // SUM
  // AVG
  // COALESCE
  // GROUP BY
  // =====================================================
  async getOrganizationStatistics() {
    const sql = `
      SELECT
        o.organization_id,
        o.organization_name,
        o.organization_type,
        o.verification_status,

        COUNT(i.inventory_id)
          AS total_inventory_records,

        COALESCE(
          SUM(i.received_quantity),
          0
        ) AS total_received_quantity,

        COALESCE(
          SUM(i.available_quantity),
          0
        ) AS total_available_quantity,

        COALESCE(
          AVG(i.available_quantity),
          0
        ) AS average_available_quantity

      FROM organization o

      LEFT OUTER JOIN inventory i
        ON o.organization_id = i.organization_id

      GROUP BY
        o.organization_id,
        o.organization_name,
        o.organization_type,
        o.verification_status

      ORDER BY
        total_available_quantity DESC;
    `;

    return this.databaseService.query(sql);
  }
    // =====================================================
  // FEATURE 5: User-Organization Relationship Audit
  // SQL Concept: RIGHT OUTER JOIN
  // Shows all users even when they have no organization
  // =====================================================
  async getUserOrganizationRelationship() {
    const sql = `
      SELECT
        u.user_id,
        u.full_name,
        u.email,
        u.phone,
        u.user_type,
        u.account_status,

        o.organization_id,
        o.organization_name,
        o.organization_type,
        o.licence_number,
        o.verification_status

      FROM organization o

      RIGHT OUTER JOIN \`user\` u
        ON o.user_id = u.user_id

      ORDER BY u.user_id ASC;
    `;

    return this.databaseService.query(sql);
  }
    // =====================================================
  // FEATURE 6: Complete User-Organization Directory
  // SQL Concept: FULL OUTER JOIN equivalent in MySQL
  // Implemented using LEFT OUTER JOIN + RIGHT OUTER JOIN + UNION
  // =====================================================
  async getCompleteUserOrganizationDirectory() {
    const sql = `
      SELECT
        u.user_id,
        u.full_name,
        u.email,
        u.user_type,

        o.organization_id,
        o.organization_name,
        o.organization_type,
        o.verification_status

      FROM \`user\` u

      LEFT OUTER JOIN organization o
        ON u.user_id = o.user_id


      UNION


      SELECT
        u.user_id,
        u.full_name,
        u.email,
        u.user_type,

        o.organization_id,
        o.organization_name,
        o.organization_type,
        o.verification_status

      FROM \`user\` u

      RIGHT OUTER JOIN organization o
        ON u.user_id = o.user_id

      ORDER BY user_id;
    `;

    return this.databaseService.query(sql);
  }
    // =====================================================
  // FEATURE 7: Organizations With Sufficient Stock
  // SQL Concepts:
  // INNER JOIN
  // SUM
  // GROUP BY
  // HAVING
  // =====================================================
  async getOrganizationsWithSufficientStock() {
    const sql = `
      SELECT
        o.organization_id,
        o.organization_name,
        o.organization_type,

        COUNT(i.inventory_id)
          AS inventory_records,

        SUM(i.available_quantity)
          AS total_available_quantity

      FROM organization o

      INNER JOIN inventory i
        ON o.organization_id = i.organization_id

      GROUP BY
        o.organization_id,
        o.organization_name,
        o.organization_type

      HAVING SUM(i.available_quantity) > 10

      ORDER BY total_available_quantity DESC;
    `;

    return this.databaseService.query(sql);
  }

    // =====================================================
  // FEATURE 8: Organizations Above Average Stock
  // SQL Concepts:
  // INNER JOIN
  // GROUP BY
  // SUM
  // AVG
  // HAVING
  // SUBQUERY
  // Derived table
  // =====================================================
  async getOrganizationsAboveAverageStock() {
    const sql = `
      SELECT
        o.organization_id,
        o.organization_name,
        o.organization_type,

        SUM(i.available_quantity)
          AS total_available_quantity

      FROM organization o

      INNER JOIN inventory i
        ON o.organization_id = i.organization_id

      GROUP BY
        o.organization_id,
        o.organization_name,
        o.organization_type

      HAVING SUM(i.available_quantity) > (

        SELECT AVG(organization_totals.total_stock)

        FROM (
          SELECT
            i2.organization_id,
            SUM(i2.available_quantity) AS total_stock

          FROM inventory i2

          GROUP BY i2.organization_id
        ) AS organization_totals

      )

      ORDER BY total_available_quantity DESC;
    `;

    return this.databaseService.query(sql);
  }
}