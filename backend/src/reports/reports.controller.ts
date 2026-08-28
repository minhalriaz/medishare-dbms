import { Controller, Get } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('donation-summary')
  donationSummary() { return this.reportsService.donationSummary(); }

  @Get('medicine-contribution')
  medicineContribution() { return this.reportsService.medicineContribution(); }

  @Get('organization-activity')
  organizationActivity() { return this.reportsService.organizationActivity(); }

  @Get('donations-needing-attention')
  donationsNeedingAttention() { return this.reportsService.donationsNeedingAttention(); }

  @Get('high-volume-donations')
  highVolumeDonations() { return this.reportsService.highVolumeDonations(); }

  @Get('donation-insights')
  donationInsights() { return this.reportsService.donationInsights(); }
}
