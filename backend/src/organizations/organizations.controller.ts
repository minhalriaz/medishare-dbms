import { Controller, Get } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
  ) {}

  @Get()
  getOrganizationDirectory() {
    return this.organizationsService.getOrganizationDirectory();
  }

  @Get('inventory-overview')
  getOrganizationInventoryOverview() {
    return this.organizationsService.getOrganizationInventoryOverview();
  }
  @Get('medicine-inventory')
  getDetailedMedicineInventory() {
    return this.organizationsService.getDetailedMedicineInventory();
  }

  @Get('statistics')
  getOrganizationStatistics() {
    return this.organizationsService.getOrganizationStatistics();
  }
}