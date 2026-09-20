import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Verification } from './entities/verification.entity';
import { CreateVerificationDto } from './dto/create-verification.dto';
import { UpdateVerificationDto } from './dto/update-verification.dto';

@Injectable()
export class VerificationService implements OnModuleInit {
  constructor(
    @InjectRepository(Verification)
    private readonly verificationRepository: Repository<Verification>,

    private readonly dataSource: DataSource,
  ) {}

  // ==========================================
  // DATABASE OBJECT INITIALIZATION
  // Creates VIEW, STORED PROCEDURE and TRIGGER
  // ==========================================

  async onModuleInit() {
    await this.createDatabaseObjects();
  }

  private async createDatabaseObjects() {
    // ==========================================
    // 1. VIEW
    // ==========================================

    await this.dataSource.query(`
      CREATE OR ALTER VIEW vw_verification_details
      AS
      SELECT
        v.verification_id,
        v.donation_item_id,
        v.verified_by_user_id,
        u.full_name AS verified_by,
        u.email AS verifier_email,
        di.donation_id,
        di.medicine_id,
        m.medicine_name,
        di.batch_number,
        di.quantity,
        di.manufacturing_date,
        di.expiry_date,
        di.packaging_condition,
        di.storage_condition,
        d.donation_date,
        d.donation_status,
        d.receiving_organization_id,
        o.organization_name,
        v.verification_date,
        v.verification_result,
        v.verification_remarks
      FROM verification v
      INNER JOIN donation_item di
        ON v.donation_item_id = di.donation_item_id
      INNER JOIN [user] u
        ON v.verified_by_user_id = u.user_id
      INNER JOIN medicine m
        ON di.medicine_id = m.medicine_id
      INNER JOIN donation d
        ON di.donation_id = d.donation_id
      INNER JOIN organization o
        ON d.receiving_organization_id = o.organization_id;
    `);

    // ==========================================
    // 2. STORED PROCEDURE
    // Find verification records by result
    // ==========================================

    await this.dataSource.query(`
      CREATE OR ALTER PROCEDURE sp_get_verifications_by_result
        @verification_result VARCHAR(50)
      AS
      BEGIN
        SET NOCOUNT ON;

        SELECT *
        FROM vw_verification_details
        WHERE verification_result = @verification_result
        ORDER BY verification_id DESC;
      END;
    `);

    // ==========================================
    // 3. TRIGGER
    // Prevent the same donation item
    // from being verified more than once
    // ==========================================

    await this.dataSource.query(`
      CREATE OR ALTER TRIGGER trg_prevent_duplicate_verification
      ON verification
      AFTER INSERT, UPDATE
      AS
      BEGIN
        SET NOCOUNT ON;

        IF EXISTS (
          SELECT donation_item_id
          FROM verification
          GROUP BY donation_item_id
          HAVING COUNT(*) > 1
        )
        BEGIN
          ROLLBACK TRANSACTION;

          THROW 50001,
            'This donation item has already been verified.',
            1;
        END
      END;
    `);
  }

  // ==========================================
  // CREATE
  // ==========================================

  async create(createVerificationDto: CreateVerificationDto) {
    // Check donation item exists
    const donationItem = await this.dataSource.query(
      `
      SELECT donation_item_id
      FROM donation_item
      WHERE donation_item_id = @0
      `,
      [createVerificationDto.donation_item_id],
    );

    if (donationItem.length === 0) {
      throw new BadRequestException(
        `Donation Item ID ${createVerificationDto.donation_item_id} does not exist`,
      );
    }

    // Check user exists
    const user = await this.dataSource.query(
      `
      SELECT user_id
      FROM [user]
      WHERE user_id = @0
      `,
      [createVerificationDto.verified_by_user_id],
    );

    if (user.length === 0) {
      throw new BadRequestException(
        `User ID ${createVerificationDto.verified_by_user_id} does not exist`,
      );
    }

    // Check whether this donation item
    // has already been verified
    const existingVerification = await this.dataSource.query(
      `
      SELECT verification_id
      FROM verification
      WHERE donation_item_id = @0
      `,
      [createVerificationDto.donation_item_id],
    );

    if (existingVerification.length > 0) {
      throw new BadRequestException(
        `Donation Item ID ${createVerificationDto.donation_item_id} has already been verified`,
      );
    }

    const verification = this.verificationRepository.create({
      ...createVerificationDto,
      verification_date: new Date(),
    });

    return await this.verificationRepository.save(verification);
  }

  // ==========================================
  // READ ALL
  // ==========================================

  async findAll() {
    return await this.verificationRepository.find({
      order: {
        verification_id: 'DESC',
      },
    });
  }

  // ==========================================
  // READ ONE
  // ==========================================

  async findOne(id: number) {
    const verification =
      await this.verificationRepository.findOneBy({
        verification_id: id,
      });

    if (!verification) {
      throw new NotFoundException(
        `Verification with ID ${id} not found`,
      );
    }

    return verification;
  }

  // ==========================================
  // UPDATE
  // ==========================================

  async update(
    id: number,
    updateVerificationDto: UpdateVerificationDto,
  ) {
    const verification = await this.findOne(id);

    // Check donation item if being changed
    if (
      updateVerificationDto.donation_item_id !== undefined
    ) {
      const donationItem = await this.dataSource.query(
        `
        SELECT donation_item_id
        FROM donation_item
        WHERE donation_item_id = @0
        `,
        [updateVerificationDto.donation_item_id],
      );

      if (donationItem.length === 0) {
        throw new BadRequestException(
          `Donation Item ID ${updateVerificationDto.donation_item_id} does not exist`,
        );
      }

      // Prevent assigning another verification
      // to an already verified donation item
      const duplicateVerification =
        await this.dataSource.query(
          `
          SELECT verification_id
          FROM verification
          WHERE donation_item_id = @0
            AND verification_id <> @1
          `,
          [
            updateVerificationDto.donation_item_id,
            id,
          ],
        );

      if (duplicateVerification.length > 0) {
        throw new BadRequestException(
          `Donation Item ID ${updateVerificationDto.donation_item_id} has already been verified`,
        );
      }
    }

    // Check user if being changed
    if (
      updateVerificationDto.verified_by_user_id !== undefined
    ) {
      const user = await this.dataSource.query(
        `
        SELECT user_id
        FROM [user]
        WHERE user_id = @0
        `,
        [updateVerificationDto.verified_by_user_id],
      );

      if (user.length === 0) {
        throw new BadRequestException(
          `User ID ${updateVerificationDto.verified_by_user_id} does not exist`,
        );
      }
    }

    Object.assign(
      verification,
      updateVerificationDto,
    );

    return await this.verificationRepository.save(
      verification,
    );
  }

  // ==========================================
  // DELETE
  // ==========================================

  async remove(id: number) {
    const verification = await this.findOne(id);

    await this.verificationRepository.remove(
      verification,
    );

    return {
      message: `Verification with ID ${id} deleted successfully`,
    };
  }

  // ==========================================
  // VIEW DETAILS
  // ==========================================

  async findVerificationDetails() {
    return await this.dataSource.query(`
      SELECT *
      FROM vw_verification_details
      ORDER BY verification_id DESC
    `);
  }

  // ==========================================
  // STORED PROCEDURE
  // ==========================================

  async findByResult(result: string) {
    return await this.dataSource.query(
      `
      EXEC sp_get_verifications_by_result @0
      `,
      [result],
    );
  }
}