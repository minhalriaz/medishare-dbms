import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

import { VerificationService } from './verification.service';
import { CreateVerificationDto } from './dto/create-verification.dto';
import { UpdateVerificationDto } from './dto/update-verification.dto';

@Controller('verification')
export class VerificationController {
  constructor(
    private readonly verificationService: VerificationService,
  ) {}

  // ==========================================
  // CREATE
  // POST /verification
  // ==========================================

  @Post()
  create(
    @Body() createVerificationDto: CreateVerificationDto,
  ) {
    return this.verificationService.create(
      createVerificationDto,
    );
  }

  // ==========================================
  // READ ALL
  // GET /verification
  // ==========================================

  @Get()
  findAll() {
    return this.verificationService.findAll();
  }

  // ==========================================
  // VIEW DETAILS
  // GET /verification/details
  // ==========================================

  @Get('details')
  findVerificationDetails() {
    return this.verificationService.findVerificationDetails();
  }

  // ==========================================
  // STORED PROCEDURE
  // GET /verification/result?result=Approved
  // ==========================================

  @Get('result')
  findByResult(
    @Query('result') result: string,
  ) {
    return this.verificationService.findByResult(
      result,
    );
  }

  // ==========================================
  // READ ONE
  // GET /verification/:id
  // ==========================================

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.verificationService.findOne(id);
  }

  // ==========================================
  // UPDATE
  // PATCH /verification/:id
  // ==========================================

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVerificationDto: UpdateVerificationDto,
  ) {
    return this.verificationService.update(
      id,
      updateVerificationDto,
    );
  }

  // ==========================================
  // DELETE
  // DELETE /verification/:id
  // ==========================================

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.verificationService.remove(id);
  }
}