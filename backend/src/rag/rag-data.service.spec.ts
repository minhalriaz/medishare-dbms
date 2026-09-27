import { DatabaseService } from '../database/database.service';
import { ReportsService } from '../reports/reports.service';
import { RagDataService } from './rag-data.service';

describe('RagDataService', () => {
  let database: { query: jest.Mock };
  let service: RagDataService;

  beforeEach(() => {
    database = { query: jest.fn().mockResolvedValue([]) };
    service = new RagDataService(database as unknown as DatabaseService);
  });

  it('uses a fixed count query for medicine totals', async () => {
    await service.retrieve({
      mode: 'database',
      entity: 'medicine',
      action: 'count',
      contextualQuestion: 'How many medicines are available?',
    });

    expect(database.query).toHaveBeenCalledWith(
      expect.stringMatching(/^SELECT COUNT\(\*\).*dbo\.medicine/is),
      [],
    );
  });

  it('passes user-supplied status as a parameter', async () => {
    await service.retrieve({
      mode: 'database',
      entity: 'requests',
      action: 'count',
      status: "Pending'; DELETE FROM dbo.medicine;--",
      contextualQuestion: 'How many pending requests?',
    });

    const [sql, params] = database.query.mock.calls[0];
    expect(sql).toMatch(/^SELECT COUNT\(\*\)/i);
    expect(sql).not.toMatch(/DELETE|UPDATE|INSERT|DROP|ALTER|TRUNCATE/i);
    expect(params).toEqual(["Pending'; DELETE FROM dbo.medicine;--"]);
  });

  it('never queries user password hashes', async () => {
    await service.retrieve({
      mode: 'database',
      entity: 'users',
      action: 'list',
      contextualQuestion: 'List users',
    });

    const [sql] = database.query.mock.calls[0];
    expect(sql).toContain('u.full_name');
    expect(sql).not.toMatch(/password_hash/i);
  });

  it('does not query verification without a checked-in DDL contract', async () => {
    const result = await service.retrieve({
      mode: 'database',
      entity: 'verification',
      action: 'count',
      contextualQuestion: 'How many verification records exist?',
    });

    expect(result.unavailableReason).toContain('verification table DDL');
    expect(database.query).not.toHaveBeenCalled();
  });

  it('does not execute an unsupported price request', async () => {
    const result = await service.retrieve({
      mode: 'database',
      entity: 'medicine',
      action: 'detail',
      unsupportedField: 'price',
      contextualQuestion: 'What is the medicine price?',
    });

    expect(result.unsupported).toBe(true);
    expect(database.query).not.toHaveBeenCalled();
  });

  it('reuses the existing report summary service for report questions', async () => {
    const reportService = {
      donationSummary: jest.fn().mockResolvedValue([{ donation_id: 2, total_quantity: 9 }]),
    };
    service = new RagDataService(
      database as unknown as DatabaseService,
      reportService as unknown as ReportsService,
    );

    const result = await service.retrieve({
      mode: 'database',
      entity: 'reports',
      action: 'summary',
      contextualQuestion: 'Show the donation summary report',
    });

    expect(reportService.donationSummary).toHaveBeenCalledTimes(1);
    expect(result.rows).toEqual([{ donation_id: 2, total_quantity: 9 }]);
    expect(database.query).not.toHaveBeenCalled();
  });
});