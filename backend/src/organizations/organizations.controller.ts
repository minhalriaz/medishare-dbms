import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
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

  @Get('user-relationship')
  getUserOrganizationRelationship() {
    return this.organizationsService.getUserOrganizationRelationship();
  }

  @Get('complete-directory')
  getCompleteUserOrganizationDirectory() {
    return this.organizationsService.getCompleteUserOrganizationDirectory();
  }
  @Get('sufficient-stock')
  getOrganizationsWithSufficientStock() {
    return this.organizationsService.getOrganizationsWithSufficientStock();
  }
  @Get('above-average-stock')
  getOrganizationsAboveAverageStock() {
    return this.organizationsService.getOrganizationsAboveAverageStock();
  }
    @Get(':id')
  getOrganizationById(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.organizationsService
      .getOrganizationById(id);
  }

  @Put(':id')
  updateOrganization(
    @Param('id', ParseIntPipe) id: number,

    @Body()
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
    return this.organizationsService
      .updateOrganization(id, data);
  }
  @Get('search')
  searchOrganizations(@Query('query') query: string) {
    return this.organizationsService.searchOrganizations(query);
  }
    @Post()
  createOrganization(
    @Body()
    data: {
      full_name: string;
      email: string;
      phone?: string;
      address?: string;

      organization_name: string;
      organization_type: string;
      licence_number: string;
      organization_address?: string;
      verification_status?: string;
    },
  ) {
    return this.organizationsService.createOrganization(
      data,
    );
  }
    @Delete(':id')
  deleteOrganization(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.organizationsService
      .deleteOrganization(id);
  }
  
}