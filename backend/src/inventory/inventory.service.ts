import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Inventory } from './entities/inventory.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  private validateQuantities(receivedQuantity: number, availableQuantity: number) {
    if (availableQuantity > receivedQuantity) {
      throw new BadRequestException(
        'Available Quantity cannot exceed Received Quantity',
      );
    }
  }

  // CREATE
  async create(createInventoryDto: CreateInventoryDto) {
    this.validateQuantities(
      createInventoryDto.received_quantity,
      createInventoryDto.available_quantity,
    );

    const inventory = this.inventoryRepository.create(createInventoryDto);
    return this.inventoryRepository.save(inventory);
  }

  // READ ALL
  async findAll() {
    return this.inventoryRepository.find({
      order: { inventory_id: 'DESC' },
    });
  }

  // READ ONE
  async findOne(id: number) {
    const inventory = await this.inventoryRepository.findOneBy({
      inventory_id: id,
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    return inventory;
  }

  // UPDATE
  async update(id: number, updateInventoryDto: UpdateInventoryDto) {
    const inventory = await this.findOne(id);
    Object.assign(inventory, updateInventoryDto);

    this.validateQuantities(
      inventory.received_quantity,
      inventory.available_quantity,
    );

    return this.inventoryRepository.save(inventory);
  }

  // DELETE
  async remove(id: number) {
    const inventory = await this.findOne(id);
    await this.inventoryRepository.remove(inventory);

    return {
      message: `Inventory with ID ${id} deleted successfully`,
    };
  }
}
