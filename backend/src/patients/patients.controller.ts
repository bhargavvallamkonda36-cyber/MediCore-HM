
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { Roles } from '../guards/roles.decorator.js';
import { UserRole } from '../generated/prisma/client.js';

import { PatientsService } from './patients.service.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';

interface AuthenticatedRequest extends Request {
  user: {
    sub?: number | string;
    id?: number | string;
    userId?: number | string;
    role: UserRole;
  };
}

@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
  constructor(
    private readonly patientsService: PatientsService,
  ) {}

  // ADMIN and RECEPTIONIST can register patients.
  @Post()
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  // Authorized staff can list patient records.
  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.RECEPTIONIST,
    UserRole.NURSE,
  )
  findAll() {
    return this.patientsService.findAll();
  }

  // Staff can view patient records.
  // Patients can view their own record only.
  @Get(':id')
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.RECEPTIONIST,
    UserRole.NURSE,
    UserRole.PATIENT,
  )
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.patientsService.findOne(id, req.user);
  }

  // ADMIN can update all supported patient fields.
  // PATIENT can update only permitted fields on their own record.
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PATIENT)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePatientDto: UpdatePatientDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.patientsService.update(
      id,
      updatePatientDto,
      req.user,
    );
  }

  // Only ADMIN can delete patient records.
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.patientsService.remove(id);
  }
}