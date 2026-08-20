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
}