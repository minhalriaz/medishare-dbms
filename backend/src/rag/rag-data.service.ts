import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ReportsService } from '../reports/reports.service';
import { RagQuestionPlan } from './question-analyzer';

export interface RagDatabaseResult {
  context: string;
  rows: Record<string, unknown>[];
  tables: string[];
  unavailableReason?: string;
  unsupported?: boolean;
  applicationOnly?: boolean;
}

@Injectable()
export class RagDataService {
  constructor(
    private readonly database: DatabaseService,
    private readonly reports?: ReportsService,
  ) {}

  async retrieve(plan: RagQuestionPlan): Promise<RagDatabaseResult> {
    if (plan.unsupportedField) {
      return this.unavailable(
        `The database and application schema do not provide a ${plan.unsupportedField} field.`,
        true,
      );
    }

    if (!plan.entity) {
      return this.unavailable('No supported MediShare data entity was identified.', true);
    }

    if (plan.entity === 'verification') {
      return this.unavailable(
        'Live verification-record data is unavailable because the deployed verification table DDL is not present in the checked-in SQL.',
      );
    }

    if (plan.entity === 'reports') return this.reportResults(plan);

    switch (plan.entity) {
      case 'medicine':
        return this.medicines(plan);
      case 'inventory':
        return this.inventory(plan);
      case 'donations':
        return this.donations(plan);
      case 'donation-items':
        return this.donationItems(plan);
      case 'organizations':
        return this.organizations(plan);
      case 'users':
        return this.users(plan);
      case 'requests':
        return this.requests(plan);
      case 'request-items':
        return this.requestItems(plan);
      case 'distributions':
        return this.distributions(plan);
      case 'distribution-items':
        return this.distributionItems(plan);
      case 'medicine-audit':
        return this.medicineAudit(plan);
    }
  }

  private async medicines(plan: RagQuestionPlan): Promise<RagDatabaseResult> {
    if (plan.action === 'count') {
      return this.select('medicines', 'medicine', 'SELECT COUNT(*) AS medicine_count FROM dbo.medicine');
    }

    const where = plan.recordId !== undefined
      ? 'WHERE m.medicine_id = @0'
      : plan.searchTerm
        ? `WHERE m.medicine_name LIKE CONCAT(N'%', @0, N'%') OR m.generic_name LIKE CONCAT(N'%', @0, N'%')`
        : '';
    const params = plan.recordId !== undefined ? [plan.recordId] : plan.searchTerm ? [plan.searchTerm] : [];
    return this.select(
      'medicines',
      'medicine',
      `SELECT TOP (10) m.medicine_id, m.medicine_name, m.generic_name, m.manufacturer,
        m.dosage_form, m.strength, m.medicine_category, m.prescription_required
       FROM dbo.medicine AS m ${where}
       ORDER BY m.medicine_name ASC, m.medicine_id ASC`,
      params,
    );
  }

  private async inventory(plan: RagQuestionPlan): Promise<RagDatabaseResult> {
    if (plan.action === 'count' || plan.action === 'summary') {
      return this.select(
        'inventory summary',
        'inventory',
        `SELECT COUNT(*) AS inventory_records,
          COALESCE(SUM(i.received_quantity), 0) AS total_received_quantity,
          COALESCE(SUM(i.available_quantity), 0) AS total_available_quantity,
          COUNT(DISTINCT donated.medicine_id) AS distinct_medicines,
          COUNT(DISTINCT CASE WHEN i.available_quantity > 0 THEN donated.medicine_id END) AS distinct_available_medicines,
          SUM(CASE WHEN i.inventory_status = 'Low Stock' THEN 1 ELSE 0 END) AS low_stock_records,
          SUM(CASE WHEN i.inventory_status = 'Out of Stock' THEN 1 ELSE 0 END) AS out_of_stock_records
        FROM dbo.inventory AS i
        LEFT JOIN dbo.donation_item AS donated ON donated.donation_item_id = i.donation_item_id`,
        [],
        ['inventory', 'donation_item'],
      );
    }

    const where = plan.recordId !== undefined
      ? 'WHERE i.inventory_id = @0'
      : plan.status
        ? 'WHERE i.inventory_status = @0'
        : /\blow stock|low stock|out of stock\b/i.test(plan.contextualQuestion)
          ? "WHERE i.inventory_status IN ('Low Stock', 'Out of Stock')"
          : '';
    const params = plan.recordId !== undefined ? [plan.recordId] : plan.status ? [plan.status] : [];
    return this.select(
      'inventory records',
      'inventory',
      `SELECT TOP (10) i.inventory_id, i.organization_id, o.organization_name,
        i.donation_item_id, donated.medicine_id, m.medicine_name, m.strength,
        donated.batch_number, donated.expiry_date, i.received_quantity,
        i.available_quantity, i.storage_location, i.inventory_status, i.added_date
       FROM dbo.inventory AS i
       LEFT JOIN dbo.organization AS o ON o.organization_id = i.organization_id
       LEFT JOIN dbo.donation_item AS donated ON donated.donation_item_id = i.donation_item_id
       LEFT JOIN dbo.medicine AS m ON m.medicine_id = donated.medicine_id
       ${where}
       ORDER BY i.added_date DESC, i.inventory_id DESC`,
      params,
      ['inventory', 'organization', 'donation_item', 'medicine'],
    );
  }

  private async donations(plan: RagQuestionPlan): Promise<RagDatabaseResult> {
    if (plan.action === 'count') {
      const query = plan.status
        ? 'SELECT COUNT(*) AS donation_count FROM dbo.donation WHERE donation_status = @0'
        : 'SELECT COUNT(*) AS donation_count FROM dbo.donation';
      return this.select('donations', 'donation', query, plan.status ? [plan.status] : []);
    }
    const where = plan.recordId !== undefined
      ? 'WHERE d.donation_id = @0'
      : plan.status
        ? 'WHERE d.donation_status = @0'
        : '';
    const params = plan.recordId !== undefined ? [plan.recordId] : plan.status ? [plan.status] : [];
    return this.select(
      'donations',
      'donation',
      `SELECT TOP (10) d.donation_id, d.donor_user_id, u.full_name AS donor_name,
        d.receiving_organization_id, o.organization_name, d.donation_date, d.donation_status,
        (SELECT COUNT(*) FROM dbo.donation_item AS di WHERE di.donation_id = d.donation_id) AS item_count,
        (SELECT COALESCE(SUM(di.quantity), 0) FROM dbo.donation_item AS di WHERE di.donation_id = d.donation_id) AS total_quantity
       FROM dbo.donation AS d
       LEFT JOIN dbo.[user] AS u ON u.user_id = d.donor_user_id
       LEFT JOIN dbo.organization AS o ON o.organization_id = d.receiving_organization_id
       ${where}
       ORDER BY d.donation_date DESC, d.donation_id DESC`,
      params,
      ['donation', 'donation_item', 'user', 'organization'],
    );
  }

  private async donationItems(plan: RagQuestionPlan): Promise<RagDatabaseResult> {
    if (plan.action === 'count') {
      return this.select('donation items', 'donation_item', 'SELECT COUNT(*) AS donation_item_count FROM dbo.donation_item');
    }
    const where = plan.recordId !== undefined
      ? 'WHERE di.donation_item_id = @0'
      : plan.searchTerm
        ? `WHERE m.medicine_name LIKE CONCAT(N'%', @0, N'%') OR m.generic_name LIKE CONCAT(N'%', @0, N'%')`
        : '';
    const params = plan.recordId !== undefined ? [plan.recordId] : plan.searchTerm ? [plan.searchTerm] : [];
    return this.select(
      'donation items',
      'donation_item',
      `SELECT TOP (10) di.donation_item_id, di.donation_id, di.medicine_id, m.medicine_name,
        m.generic_name, m.strength, di.batch_number, di.quantity, di.manufacturing_date,
        di.expiry_date, di.packaging_condition, di.storage_condition
       FROM dbo.donation_item AS di
       LEFT JOIN dbo.medicine AS m ON m.medicine_id = di.medicine_id
       ${where}
       ORDER BY di.donation_item_id DESC`,
      params,
      ['donation_item', 'medicine'],
    );
  }

  private async organizations(plan: RagQuestionPlan): Promise<RagDatabaseResult> {
    if (plan.action === 'count') {
      const query = plan.status
        ? 'SELECT COUNT(*) AS organization_count FROM dbo.organization WHERE verification_status = @0'
        : 'SELECT COUNT(*) AS organization_count FROM dbo.organization';
      return this.select('organizations', 'organization', query, plan.status ? [plan.status] : []);
    }
    const where = plan.recordId !== undefined
      ? 'WHERE o.organization_id = @0'
      : plan.status
        ? 'WHERE o.verification_status = @0'
        : plan.searchTerm
          ? `WHERE o.organization_name LIKE CONCAT(N'%', @0, N'%')`
          : '';
    const params = plan.recordId !== undefined ? [plan.recordId] : plan.status ? [plan.status] : plan.searchTerm ? [plan.searchTerm] : [];
    return this.select(
      'organizations',
      'organization',
      `SELECT TOP (10) o.organization_id, o.organization_name, o.organization_type,
        o.licence_number, o.organization_address, o.verification_status
       FROM dbo.organization AS o ${where}
       ORDER BY o.organization_name ASC, o.organization_id ASC`,
      params,
    );
  }

  private async users(plan: RagQuestionPlan): Promise<RagDatabaseResult> {
    if (plan.action === 'count') {
      return this.select('users', 'user', 'SELECT COUNT(*) AS user_count FROM dbo.[user]');
    }
    const where = plan.recordId !== undefined
      ? 'WHERE u.user_id = @0'
      : plan.searchTerm
        ? `WHERE u.full_name LIKE CONCAT(N'%', @0, N'%')`
        : '';
    const params = plan.recordId !== undefined ? [plan.recordId] : plan.searchTerm ? [plan.searchTerm] : [];
    return this.select(
      'users',
      'user',
      `SELECT TOP (10) u.user_id, u.full_name, u.user_type, u.account_status, u.created_at
       FROM dbo.[user] AS u ${where}
       ORDER BY u.created_at DESC, u.user_id DESC`,
      params,
    );
  }

  private async requests(plan: RagQuestionPlan): Promise<RagDatabaseResult> {
    if (plan.action === 'count') {
      const query = plan.status
        ? 'SELECT COUNT(*) AS request_count FROM dbo.medicine_request WHERE request_status = @0'
        : 'SELECT COUNT(*) AS request_count FROM dbo.medicine_request';
      return this.select('medicine requests', 'medicine_request', query, plan.status ? [plan.status] : []);
    }
    const where = plan.recordId !== undefined
      ? 'WHERE r.request_id = @0'
      : plan.status
        ? 'WHERE r.request_status = @0'
        : '';
    const params = plan.recordId !== undefined ? [plan.recordId] : plan.status ? [plan.status] : [];
    return this.select(
      'medicine requests',
      'medicine_request',
      `SELECT TOP (10) r.request_id, r.requester_user_id, u.full_name AS requester_name,
        r.requested_from_organization_id, o.organization_name, r.priority_level,
        r.request_status, r.request_date,
        (SELECT COALESCE(SUM(ri.quantity), 0) FROM dbo.request_item AS ri WHERE ri.request_id = r.request_id) AS total_requested_quantity
       FROM dbo.medicine_request AS r
       INNER JOIN dbo.[user] AS u ON u.user_id = r.requester_user_id
       INNER JOIN dbo.organization AS o ON o.organization_id = r.requested_from_organization_id
       ${where}
       ORDER BY r.request_date DESC, r.request_id DESC`,
      params,
      ['medicine_request', 'request_item', 'user', 'organization'],
    );
  }

  private async requestItems(plan: RagQuestionPlan): Promise<RagDatabaseResult> {
    if (plan.action === 'count') {
      return this.select('request items', 'request_item', 'SELECT COUNT(*) AS request_item_count FROM dbo.request_item');
    }
    const where = plan.recordId !== undefined
      ? 'WHERE ri.request_item_id = @0'
      : plan.searchTerm
        ? `WHERE m.medicine_name LIKE CONCAT(N'%', @0, N'%') OR m.generic_name LIKE CONCAT(N'%', @0, N'%')`
        : '';
    const params = plan.recordId !== undefined ? [plan.recordId] : plan.searchTerm ? [plan.searchTerm] : [];
    return this.select(
      'request items',
      'request_item',
      `SELECT TOP (10) ri.request_item_id, ri.request_id, mr.request_status,
        ri.medicine_id, m.medicine_name, m.generic_name, m.strength, ri.quantity, ri.notes
       FROM dbo.request_item AS ri
       INNER JOIN dbo.medicine_request AS mr ON mr.request_id = ri.request_id
       INNER JOIN dbo.medicine AS m ON m.medicine_id = ri.medicine_id
       ${where}
       ORDER BY ri.request_item_id DESC`,
      params,
      ['request_item', 'medicine_request', 'medicine'],
    );
  }

  private async distributions(plan: RagQuestionPlan): Promise<RagDatabaseResult> {
    if (plan.action === 'count') {
      const query = plan.status
        ? 'SELECT COUNT(*) AS distribution_count FROM dbo.distribution WHERE distribution_status = @0'
        : 'SELECT COUNT(*) AS distribution_count FROM dbo.distribution';
      return this.select('distributions', 'distribution', query, plan.status ? [plan.status] : []);
    }
    const where = plan.recordId !== undefined
      ? 'WHERE d.distribution_id = @0'
      : plan.status
        ? 'WHERE d.distribution_status = @0'
        : '';
    const params = plan.recordId !== undefined ? [plan.recordId] : plan.status ? [plan.status] : [];
    return this.select(
      'distributions',
      'distribution',
      `SELECT TOP (10) d.distribution_id, d.request_id, mr.request_status,
        d.distributed_by_organization_id, distributor.organization_name AS distributor_name,
        mr.requested_from_organization_id, requested.organization_name AS requested_from_organization,
        d.distribution_date, d.distribution_status
       FROM dbo.distribution AS d
       INNER JOIN dbo.medicine_request AS mr ON mr.request_id = d.request_id
       INNER JOIN dbo.organization AS distributor ON distributor.organization_id = d.distributed_by_organization_id
       INNER JOIN dbo.organization AS requested ON requested.organization_id = mr.requested_from_organization_id
       ${where}
       ORDER BY d.distribution_date DESC, d.distribution_id DESC`,
      params,
      ['distribution', 'medicine_request', 'organization'],
    );
  }

  private async distributionItems(plan: RagQuestionPlan): Promise<RagDatabaseResult> {
    if (plan.action === 'count') {
      return this.select('distribution items', 'distribution_item', 'SELECT COUNT(*) AS distribution_item_count FROM dbo.distribution_item');
    }
    const where = plan.recordId !== undefined
      ? 'WHERE di.distribution_item_id = @0'
      : '';
    return this.select(
      'distribution items',
      'distribution_item',
      `SELECT TOP (10) di.distribution_item_id, di.distribution_id, d.request_id,
        d.distribution_status, di.inventory_id, i.organization_id, m.medicine_name,
        m.strength, donated.batch_number, di.distributed_quantity
       FROM dbo.distribution_item AS di
       INNER JOIN dbo.distribution AS d ON d.distribution_id = di.distribution_id
       INNER JOIN dbo.inventory AS i ON i.inventory_id = di.inventory_id
       INNER JOIN dbo.donation_item AS donated ON donated.donation_item_id = i.donation_item_id
       INNER JOIN dbo.medicine AS m ON m.medicine_id = donated.medicine_id
       ${where}
       ORDER BY di.distribution_item_id DESC`,
      plan.recordId !== undefined ? [plan.recordId] : [],
      ['distribution_item', 'distribution', 'inventory', 'donation_item', 'medicine'],
    );
  }

  private async medicineAudit(plan: RagQuestionPlan): Promise<RagDatabaseResult> {
    if (plan.action === 'count') {
      return this.select('medicine audit records', 'medicine_audit', 'SELECT COUNT(*) AS audit_record_count FROM dbo.medicine_audit');
    }
    const where = plan.recordId !== undefined
      ? 'WHERE a.medicine_id = @0'
      : plan.searchTerm
        ? `WHERE m.medicine_name LIKE CONCAT(N'%', @0, N'%')`
        : '';
    const params = plan.recordId !== undefined ? [plan.recordId] : plan.searchTerm ? [plan.searchTerm] : [];
    return this.select(
      'medicine audit records',
      'medicine_audit',
      `SELECT TOP (10) a.audit_id, a.medicine_id, m.medicine_name,
        a.action_type, a.changed_at, a.changed_by, a.medicine_name_old,
        a.medicine_name_new, a.strength_old, a.strength_new
       FROM dbo.medicine_audit AS a
       LEFT JOIN dbo.medicine AS m ON m.medicine_id = a.medicine_id
       ${where}
       ORDER BY a.changed_at DESC, a.audit_id DESC`,
      params,
      ['medicine_audit', 'medicine'],
    );
  }

  private async reportResults(plan: RagQuestionPlan): Promise<RagDatabaseResult> {
    const question = plan.contextualQuestion.toLowerCase();
    if (!this.reports) {
      return this.applicationOnly('The Reports page provides donation summaries, medicine contribution, organization activity, high-volume donations and donation insights.');
    }

    if (/high[ -]?volume|more than five|over five/.test(question)) {
      const rows = await this.reports.highVolumeDonations();
      return this.reportResult('high-volume donations', rows, ['donation', 'donation_item', 'organization']);
    }
    if (/above[ -]?average|donation insights|average item quantity/.test(question)) {
      const insights = await this.reports.donationInsights();
      const rows = [
        ...(insights.quantityStats ?? []).map((row: Record<string, unknown>) => ({ metric: 'average item quantity', ...row })),
        ...(insights.aboveAverageDonations ?? []).map((row: Record<string, unknown>) => ({ metric: 'above-average donation total', ...row })),
      ];
      return this.reportResult('donation insights', rows, ['donation_item']);
    }
    if (/medicine contribution|contribution by medicine|donated quantities by medicine/.test(question)) {
      const rows = await this.reports.medicineContribution();
      return this.reportResult('medicine contribution', rows, ['medicine', 'donation_item']);
    }
    if (/organization activity|donations by organization/.test(question)) {
      const rows = await this.reports.organizationActivity();
      return this.reportResult('organization activity', rows, ['organization', 'donation']);
    }
    if (/donation summary|donation totals|summary of donations/.test(question)) {
      const rows = await this.reports.donationSummary();
      return this.reportResult('donation summary', rows, ['donation', 'donation_item', 'organization']);
    }

    return this.applicationOnly('The implemented reports are Donation Summary, Organization Activity, Medicine Contribution, High-Volume Donations (more than five units), and Donation Insights (average item quantity and donations above average total quantity).');
  }

  private reportResult(label: string, rows: Record<string, unknown>[], tables: string[]): RagDatabaseResult {
    return {
      context: `${label} (current SQL Server report result): ${JSON.stringify(rows.slice(0, 10))}`,
      rows: rows.slice(0, 10),
      tables,
    };
  }

  private applicationOnly(context: string): RagDatabaseResult {
    return { context, rows: [], tables: [], applicationOnly: true };
  }

  private async select(
    label: string,
    table: string,
    sql: string,
    params: unknown[] = [],
    tables = [table],
  ): Promise<RagDatabaseResult> {
    if (!/^\s*SELECT\b/i.test(sql) || /;\s*\S/.test(sql)) {
      throw new Error('RAG retrieval only permits one read-only SELECT statement.');
    }
    const rows = (await this.database.query(sql, params)) as Record<string, unknown>[];
    return {
      context: `${label} (current SQL Server result): ${JSON.stringify(rows)}`,
      rows,
      tables,
    };
  }

  private unavailable(reason: string, unsupported = false): RagDatabaseResult {
    return {
      context: '',
      rows: [],
      tables: [],
      unavailableReason: reason,
      unsupported,
    };
  }
}