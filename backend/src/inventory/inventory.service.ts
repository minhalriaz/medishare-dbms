import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository, DataSource } from 'typeorm';

import { CreateInventoryDto } from './dto/create-inventory.dto';

import { UpdateInventoryDto } from './dto/update-inventory.dto';

import { Inventory } from './entities/inventory.entity';


@Injectable()
export class InventoryService {

  constructor(

    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,

    private readonly dataSource: DataSource,

  ) {}


  // ==========================================
  // STATUS CALCULATION
  // ==========================================

  private calculateStatus(
    available: number,
    received: number,
  ): string {

    if (available === 0) {
      return 'Out of Stock';
    }

    if (available < received * 0.2) {
      return 'Low Stock';
    }

    return 'Available';
  }


  // ==========================================
  // CREATE
  // ==========================================

  async create(createInventoryDto: CreateInventoryDto) {

    // Check whether the donation item exists
    const donationItem = await this.dataSource.query(
      `
      SELECT donation_item_id
      FROM donation_item
      WHERE donation_item_id = @0
      `,
      [
        createInventoryDto.donation_item_id,
      ],
    );


    if (donationItem.length === 0) {

      throw new BadRequestException(
        `Donation Item ID ${createInventoryDto.donation_item_id} does not exist`,
      );

    }


    const status = this.calculateStatus(
      createInventoryDto.available_quantity,
      createInventoryDto.received_quantity,
    );


    const inventory =
      this.inventoryRepository.create({

        ...createInventoryDto,

        inventory_status: status,

      });


    return await this.inventoryRepository.save(inventory);
  }


  // ==========================================
  // READ ALL
  // ==========================================

  async findAll() {

    return await this.inventoryRepository.find();

  }


  // ==========================================
  // READ ONE
  // ==========================================

  async findOne(id: number) {

    const inventory =
      await this.inventoryRepository.findOneBy({

        inventory_id: id,

      });


    if (!inventory) {

      throw new NotFoundException(
        `Inventory with ID ${id} not found`,
      );

    }


    return inventory;

  }


  // ==========================================
  // UPDATE
  // ==========================================

  async update(
    id: number,
    updateInventoryDto: UpdateInventoryDto,
  ) {

    const inventory =
      await this.findOne(id);


    const received =
      updateInventoryDto.received_quantity ??
      inventory.received_quantity;


    const available =
      updateInventoryDto.available_quantity ??
      inventory.available_quantity;


    const status =
      this.calculateStatus(
        available,
        received,
      );


    Object.assign(
      inventory,
      updateInventoryDto,
      {
        inventory_status: status,
      },
    );


    return await this.inventoryRepository.save(
      inventory,
    );

  }


  // ==========================================
  // DELETE
  // ==========================================

  async remove(id: number) {

    const inventory =
      await this.findOne(id);


    await this.inventoryRepository.remove(
      inventory,
    );


    return {

      message:
        `Inventory with ID ${id} deleted successfully`,

    };

  }


  // ==========================================
  // JOIN DETAILS
  // ==========================================

  async findInventoryDetails() {

    return await this.dataSource.query(`

      SELECT

        i.inventory_id,

        o.organization_name,

        m.medicine_name,

        di.batch_number,

        di.expiry_date,

        i.received_quantity,

        i.available_quantity,

        i.storage_location,

        i.inventory_status,

        i.added_date


      FROM inventory i


      INNER JOIN organization o
        ON i.organization_id = o.organization_id


      INNER JOIN donation_item di
        ON i.donation_item_id = di.donation_item_id


      INNER JOIN medicine m
        ON di.medicine_id = m.medicine_id


      ORDER BY i.inventory_id DESC

    `);

  }


  // ==========================================
  // UNION
  
  // UNION combines the results and removes
  // duplicate rows.
  // ==========================================

  async findInventoryUnion() {
  return await this.dataSource.query(`

    SELECT
      inventory_id,
      organization_id,
      donation_item_id,
      received_quantity,
      available_quantity,
      storage_location,
      inventory_status
    FROM inventory
    WHERE inventory_status = 'Available'

    UNION

    SELECT
      inventory_id,
      organization_id,
      donation_item_id,
      received_quantity,
      available_quantity,
      storage_location,
      inventory_status
    FROM inventory
    WHERE inventory_status = 'Low Stock'

    UNION

    SELECT
      inventory_id,
      organization_id,
      donation_item_id,
      received_quantity,
      available_quantity,
      storage_location,
      inventory_status
    FROM inventory
    WHERE inventory_status = 'Out of Stock'

    ORDER BY inventory_id;

  `);
}


  // ==========================================
  // INTERSECT
  // ==========================================
  // Returns inventory records that satisfy
  // both conditions:
  //
  // 1. Available quantity is greater than 0
  // 2. Received quantity is greater than
  //    available quantity
  //
  // INTERSECT returns only common rows.
  // ==========================================

  async findInventoryIntersection() {

    return await this.dataSource.query(`

      SELECT

        inventory_id,

        organization_id,

        donation_item_id,

        received_quantity,

        available_quantity,

        storage_location,

        inventory_status

      FROM inventory

      WHERE available_quantity > 0


      INTERSECT


      SELECT

        inventory_id,

        organization_id,

        donation_item_id,

        received_quantity,

        available_quantity,

        storage_location,

        inventory_status

      FROM inventory

      WHERE received_quantity > available_quantity


      ORDER BY inventory_id;

    `);

  }

}