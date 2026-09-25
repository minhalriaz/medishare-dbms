import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateDistributionDto } from './dto/create-distribution.dto';
import { UpdateDistributionDto } from './dto/update-distribution.dto';

@Injectable()
export class DistributionService {
  constructor(private readonly database: DatabaseService) {}

  private readonly selectSql = `
    SELECT
      d.distribution_id,
      d.request_id,
      d.distributed_by_organization_id,
      d.distribution_date,
      d.distribution_status,
      d.received_by,
      d.delivery_note,
      mr.request_status AS request_status,
      mr.priority_level,
      mr.reason,
      source_org.organization_name AS requested_from_organization_name,
      dist_org.organization_name AS distributed_by_organization_name
    FROM distribution d
    INNER JOIN medicine_request mr
      ON mr.request_id = d.request_id
    INNER JOIN organization source_org
      ON source_org.organization_id = mr.requested_from_organization_id
    INNER JOIN organization dist_org
      ON dist_org.organization_id = d.distributed_by_organization_id`;

  private async validateRequestAndOrganization(
    requestId: number,
    organizationId: number,
  ) {
    const requestRows = await this.database.query(
      'SELECT TOP 1 request_id FROM medicine_request WHERE request_id = @0',
      [requestId],
    );

    if (!requestRows.length) {
      throw new BadRequestException(
        `Medicine request ID ${requestId} does not exist`,
      );
    }

    const organizationRows = await this.database.query(
      'SELECT TOP 1 organization_id FROM organization WHERE organization_id = @0',
      [organizationId],
    );

    if (!organizationRows.length) {
      throw new BadRequestException(
        `Organization ID ${organizationId} does not exist`,
      );
    }
  }

  private normalizeDistributionDate(value?: string | Date | null): Date {
    const parsed = value ? new Date(value) : new Date();

    if (Number.isNaN(parsed.getTime())) {
      return new Date();
    }

    return parsed;
  }

  async create(createDistributionDto: CreateDistributionDto) {
    await this.validateRequestAndOrganization(
      createDistributionDto.request_id,
      createDistributionDto.distributed_by_organization_id,
    );

    const distributionDate = this.normalizeDistributionDate(
      createDistributionDto.distribution_date,
    );

    const rows = await this.database.query(
      `INSERT INTO distribution (
        request_id,
        distributed_by_organization_id,
        distribution_date,
        distribution_status,
        received_by,
        delivery_note
      )
      OUTPUT inserted.distribution_id AS distribution_id
      VALUES (@0, @1, @2, @3, @4, @5)`,
      [
        createDistributionDto.request_id,
        createDistributionDto.distributed_by_organization_id,
        distributionDate,
        createDistributionDto.distribution_status ?? 'Pending',
        createDistributionDto.received_by ?? null,
        createDistributionDto.delivery_note ?? null,
      ],
    );

    return this.findOne(rows[0].distribution_id);
  }

  findAll() {
    return this.database.query(
      `${this.selectSql} ORDER BY d.distribution_id DESC`,
    );
  }

  async findOne(id: number) {
    const rows = await this.database.query(
      `${this.selectSql} WHERE d.distribution_id = @0`,
      [id],
    );

    if (!rows.length) {
      throw new NotFoundException(`Distribution ID ${id} not found`);
    }

    return rows[0];
  }

  async update(id: number, updateDistributionDto: UpdateDistributionDto) {
    const current = await this.findOne(id);

    const requestId = updateDistributionDto.request_id ?? current.request_id;
    const organizationId =
      updateDistributionDto.distributed_by_organization_id ??
      current.distributed_by_organization_id;

    await this.validateRequestAndOrganization(requestId, organizationId);

    await this.database.query(
      `UPDATE distribution
       SET request_id = @0,
           distributed_by_organization_id = @1,
           distribution_date = @2,
           distribution_status = @3,
           received_by = @4,
           delivery_note = @5
       WHERE distribution_id = @6`,
      [
        requestId,
        organizationId,
        updateDistributionDto.distribution_date ?? current.distribution_date,
        updateDistributionDto.distribution_status ?? current.distribution_status,
        updateDistributionDto.received_by ?? current.received_by,
        updateDistributionDto.delivery_note ?? current.delivery_note,
        id,
      ],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.database.query(
      'DELETE FROM distribution WHERE distribution_id = @0',
      [id],
    );

    return {
      message: `Distribution ID ${id} deleted successfully`,
    };
  }

  getDistributionCoverage() {
    return this.database.query(`
      SELECT
        mr.request_id,
        mr.request_status,
        d.distribution_status
      FROM medicine_request mr
      INNER JOIN (
        SELECT request_id
        FROM medicine_request
        WHERE request_status = 'Approved'

        INTERSECT

        SELECT request_id
        FROM distribution
        WHERE distribution_status IN ('Completed', 'In Transit')
      ) covered
        ON covered.request_id = mr.request_id
      INNER JOIN distribution d
        ON d.request_id = mr.request_id
       AND d.distribution_status IN ('Completed', 'In Transit')
      ORDER BY mr.request_id;
    `);
  }

  getOutstandingRequests() {
    return this.database.query(`
      SELECT
        mr.request_id,
        mr.request_status
      FROM medicine_request mr
      INNER JOIN (
        SELECT request_id
        FROM medicine_request
        WHERE request_status IN ('Pending', 'Approved')

        EXCEPT

        SELECT request_id
        FROM distribution
        WHERE distribution_status IN ('Completed', 'In Transit')
      ) outstanding
        ON outstanding.request_id = mr.request_id
      WHERE mr.request_status IN ('Pending', 'Approved')
      ORDER BY mr.request_id;
    `);
  }

  getStatusUnion() {
    return this.database.query(`
      SELECT
        mr.request_id,
        mr.request_status AS status_value,
        CAST('request' AS NVARCHAR(20)) AS record_type
      FROM medicine_request mr
      WHERE mr.request_status IN ('Pending', 'Approved', 'Rejected')

      UNION

      SELECT
        d.request_id,
        d.distribution_status AS status_value,
        CAST('distribution' AS NVARCHAR(20)) AS record_type
      FROM distribution d
      WHERE d.distribution_status IN ('Pending', 'In Transit', 'Completed')
      ORDER BY request_id, record_type;
    `);
  }

  getOrganizationDistributionMatrix() {
    return this.database.query(`
      SELECT
        d.distribution_id,
        d.request_id,
        d.distributed_by_organization_id,
        o.organization_name AS distributor_name,
        mr.requested_from_organization_id,
        req_org.organization_name AS requested_from_organization_name,
        d.distribution_status,
        d.received_by
      FROM distribution d
      CROSS JOIN organization o
      INNER JOIN medicine_request mr
        ON mr.request_id = d.request_id
      INNER JOIN organization req_org
        ON req_org.organization_id = mr.requested_from_organization_id
      WHERE o.organization_id = d.distributed_by_organization_id
      ORDER BY d.distribution_id;
    `);
  }
}
