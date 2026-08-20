import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
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
    // =====================================================
  // FEATURE 9: Search Organizations
  // SQL Concepts:
  // INNER JOIN
  // WHERE
  // LIKE
  // OR
  // Parameterized Query
  // =====================================================
  async searchOrganizations(searchTerm: string) {
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

      WHERE
        o.organization_name LIKE CONCAT('%', ?, '%')
        OR o.organization_type LIKE CONCAT('%', ?, '%')
        OR o.licence_number LIKE CONCAT('%', ?, '%')
        OR o.organization_address LIKE CONCAT('%', ?, '%')
        OR u.full_name LIKE CONCAT('%', ?, '%')

      ORDER BY o.organization_name ASC;
    `;

    const searchValue = searchTerm || '';

    return this.databaseService.query(sql, [
      searchValue,
      searchValue,
      searchValue,
      searchValue,
      searchValue,
    ]);
  }
    // =====================================================
  // FEATURE 10: Create Organization
  // SQL Concepts:
  // INSERT
  // TRANSACTION
  // FOREIGN KEY
  // PARAMETERIZED RAW QUERIES
  // =====================================================
  async createOrganization(data: {
    full_name: string;
    email: string;
    phone?: string;
    address?: string;

    organization_name: string;
    organization_type: string;
    licence_number: string;
    organization_address?: string;
    verification_status?: string;
  }) {
    const connection =
      await this.databaseService.getConnection();

    try {
      // Start transaction
      await connection.beginTransaction();

      // ---------------------------------------------
      // Validate required fields
      // ---------------------------------------------

      if (
        !data.full_name ||
        !data.email ||
        !data.organization_name ||
        !data.organization_type ||
        !data.licence_number
      ) {
        throw new BadRequestException(
          'Required organization information is missing',
        );
      }

      // ---------------------------------------------
      // RAW SQL 1:
      // Check whether email already exists
      // ---------------------------------------------

      const checkEmailSql = `
        SELECT user_id
        FROM \`user\`
        WHERE email = ?
        LIMIT 1;
      `;

      const [existingUsers]: any =
        await connection.execute(checkEmailSql, [
          data.email,
        ]);

      if (existingUsers.length > 0) {
        throw new ConflictException(
          'A user with this email already exists',
        );
      }

      // ---------------------------------------------
      // RAW SQL 2:
      // Check whether licence already exists
      // ---------------------------------------------

      const checkLicenceSql = `
        SELECT organization_id
        FROM organization
        WHERE licence_number = ?
        LIMIT 1;
      `;

      const [existingOrganizations]: any =
        await connection.execute(checkLicenceSql, [
          data.licence_number,
        ]);

      if (existingOrganizations.length > 0) {
        throw new ConflictException(
          'An organization with this licence number already exists',
        );
      }

      // ---------------------------------------------
      // RAW SQL 3:
      // Insert representative into USER
      // ---------------------------------------------

      const insertUserSql = `
        INSERT INTO \`user\`
        (
          full_name,
          email,
          phone,
          address,
          password_hash,
          user_type,
          account_status
        )
        VALUES
        (
          ?,
          ?,
          ?,
          ?,
          ?,
          'Organization',
          'Active'
        );
      `;

      const [userResult]: any =
        await connection.execute(insertUserSql, [
          data.full_name,
          data.email,
          data.phone || null,
          data.address || null,

          // Temporary value because authentication
          // is outside this Organization feature.
          'ORGANIZATION_ACCOUNT_PENDING_AUTH',
        ]);

      const userId = userResult.insertId;

      // ---------------------------------------------
      // RAW SQL 4:
      // Insert ORGANIZATION using new user_id
      // ---------------------------------------------

      const insertOrganizationSql = `
        INSERT INTO organization
        (
          user_id,
          organization_name,
          organization_type,
          licence_number,
          organization_address,
          verification_status
        )
        VALUES (?, ?, ?, ?, ?, ?);
      `;

      const [organizationResult]: any =
        await connection.execute(
          insertOrganizationSql,
          [
            userId,
            data.organization_name,
            data.organization_type,
            data.licence_number,
            data.organization_address || null,
            data.verification_status || 'Pending',
          ],
        );

      const organizationId =
        organizationResult.insertId;

      // Both INSERT queries succeeded
      await connection.commit();

      return {
        message: 'Organization created successfully',
        user_id: userId,
        organization_id: organizationId,
      };
    } catch (error) {
      // If either INSERT fails, undo everything
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }
  }
    // =====================================================
  // FEATURE 11: Get One Organization
  // SQL Concept: INNER JOIN + WHERE
  // Used by Edit Organization page
  // =====================================================
  async getOrganizationById(organizationId: number) {
    const sql = `
      SELECT
        o.organization_id,
        o.user_id,
        o.organization_name,
        o.organization_type,
        o.licence_number,
        o.organization_address,
        o.verification_status,

        u.full_name,
        u.email,
        u.phone,
        u.address

      FROM organization o

      INNER JOIN \`user\` u
        ON o.user_id = u.user_id

      WHERE o.organization_id = ?

      LIMIT 1;
    `;

    const rows: any = await this.databaseService.query(
      sql,
      [organizationId],
    );

    if (!rows.length) {
      throw new BadRequestException(
        'Organization not found',
      );
    }

    return rows[0];
  }
    // =====================================================
  // FEATURE 12: Update Organization
  // SQL Concepts:
  // TRANSACTION
  // SELECT
  // UPDATE
  // FOREIGN KEY RELATION
  // PARAMETERIZED RAW SQL
  // =====================================================
  async updateOrganization(
    organizationId: number,
    data: {
      full_name: string;
      email: string;
      phone?: string;
      address?: string;

      organization_name: string;
      organization_type: string;
      licence_number: string;
      organization_address?: string;
      verification_status: string;
    },
  ) {
    const connection =
      await this.databaseService.getConnection();

    try {
      await connection.beginTransaction();

      // Find the representative user_id
      const findOrganizationSql = `
        SELECT
          organization_id,
          user_id
        FROM organization
        WHERE organization_id = ?
        LIMIT 1;
      `;

      const [organizationRows]: any =
        await connection.execute(
          findOrganizationSql,
          [organizationId],
        );

      if (!organizationRows.length) {
        throw new BadRequestException(
          'Organization not found',
        );
      }

      const userId = organizationRows[0].user_id;

      // Check if another user already uses the email
      const checkEmailSql = `
        SELECT user_id
        FROM \`user\`
        WHERE email = ?
          AND user_id <> ?
        LIMIT 1;
      `;

      const [emailRows]: any =
        await connection.execute(checkEmailSql, [
          data.email,
          userId,
        ]);

      if (emailRows.length > 0) {
        throw new ConflictException(
          'Another user already uses this email',
        );
      }

      // Check if another organization uses the license
      const checkLicenceSql = `
        SELECT organization_id
        FROM organization
        WHERE licence_number = ?
          AND organization_id <> ?
        LIMIT 1;
      `;

      const [licenceRows]: any =
        await connection.execute(checkLicenceSql, [
          data.licence_number,
          organizationId,
        ]);

      if (licenceRows.length > 0) {
        throw new ConflictException(
          'Another organization already uses this licence number',
        );
      }

      // Update USER
      const updateUserSql = `
        UPDATE \`user\`
        SET
          full_name = ?,
          email = ?,
          phone = ?,
          address = ?
        WHERE user_id = ?;
      `;

      await connection.execute(updateUserSql, [
        data.full_name,
        data.email,
        data.phone || null,
        data.address || null,
        userId,
      ]);

      // Update ORGANIZATION
      const updateOrganizationSql = `
        UPDATE organization
        SET
          organization_name = ?,
          organization_type = ?,
          licence_number = ?,
          organization_address = ?,
          verification_status = ?
        WHERE organization_id = ?;
      `;

      await connection.execute(
        updateOrganizationSql,
        [
          data.organization_name,
          data.organization_type,
          data.licence_number,
          data.organization_address || null,
          data.verification_status,
          organizationId,
        ],
      );

      await connection.commit();

      return {
        message: 'Organization updated successfully',
        organization_id: organizationId,
        user_id: userId,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
    // =====================================================
  // FEATURE 13: Delete Organization
  // SQL Concepts:
  // DELETE
  // TRANSACTION
  // SUBQUERIES
  // COUNT
  // FOREIGN KEY SAFETY
  // PARAMETERIZED RAW SQL
  // =====================================================
  async deleteOrganization(organizationId: number) {
    const connection =
      await this.databaseService.getConnection();

    try {
      await connection.beginTransaction();

      // -------------------------------------------------
      // RAW SQL 1:
      // Find organization and its representative user
      // -------------------------------------------------

      const findOrganizationSql = `
        SELECT
          organization_id,
          user_id,
          organization_name
        FROM organization
        WHERE organization_id = ?
        LIMIT 1;
      `;

      const [organizationRows]: any =
        await connection.execute(
          findOrganizationSql,
          [organizationId],
        );

      if (!organizationRows.length) {
        throw new BadRequestException(
          'Organization not found',
        );
      }

      const organization =
        organizationRows[0];

      const userId =
        organization.user_id;

      // -------------------------------------------------
      // RAW SQL 2:
      // Check whether organization is being used
      //
      // Uses SUBQUERIES + COUNT
      // -------------------------------------------------

      const dependencyCheckSql = `
        SELECT
          (
            SELECT COUNT(*)
            FROM inventory
            WHERE organization_id = ?
          ) AS inventory_count,

          (
            SELECT COUNT(*)
            FROM donation
            WHERE receiving_organization_id = ?
          ) AS received_donation_count;
      `;

      const [dependencyRows]: any =
        await connection.execute(
          dependencyCheckSql,
          [
            organizationId,
            organizationId,
          ],
        );

      const dependencies =
        dependencyRows[0];

      if (
        Number(dependencies.inventory_count) > 0 ||
        Number(
          dependencies.received_donation_count,
        ) > 0
      ) {
        throw new BadRequestException(
          'Cannot delete this organization because it has related inventory or donation records',
        );
      }

      // -------------------------------------------------
      // RAW SQL 3:
      // Check whether representative user is a donor
      // -------------------------------------------------

      const donorCheckSql = `
        SELECT COUNT(*) AS donor_count
        FROM donation
        WHERE donor_user_id = ?;
      `;

      const [donorRows]: any =
        await connection.execute(
          donorCheckSql,
          [userId],
        );

      const donorCount =
        Number(donorRows[0].donor_count);

      // -------------------------------------------------
      // RAW SQL 4:
      // Delete ORGANIZATION first
      //
      // Must happen before deleting USER because
      // organization.user_id references user.user_id
      // -------------------------------------------------

      const deleteOrganizationSql = `
        DELETE FROM organization
        WHERE organization_id = ?;
      `;

      await connection.execute(
        deleteOrganizationSql,
        [organizationId],
      );

      // -------------------------------------------------
      // RAW SQL 5:
      // Delete representative USER only if that user
      // is not referenced as a donor
      // -------------------------------------------------

      if (donorCount === 0) {
        const deleteUserSql = `
          DELETE FROM \`user\`
          WHERE user_id = ?;
        `;

        await connection.execute(
          deleteUserSql,
          [userId],
        );
      }

      await connection.commit();

      return {
        message:
          'Organization deleted successfully',

        organization_id:
          organizationId,

        deleted_representative:
          donorCount === 0,
      };
    } catch (error) {
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }
  }
}