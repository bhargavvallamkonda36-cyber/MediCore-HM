// Example only: merge these patterns into your existing controller.
// Keep your current method bodies and route paths unless deliberately changing them.
import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { Roles } from '../guards/roles.decorator.js';
import { UserRole } from '../generated/prisma/client.js';
import { CreateDoctorDto } from './dto/create-doctor.dto.js';
import { UpdateDoctorDto } from './dto/update-doctor.dto.js';
import { DoctorsService } from './doctors.service.js';

@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateDoctorDto) {
    return this.doctorsService.create(dto);
  }

  @Get()
  @Roles(
    UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST,
    UserRole.NURSE, UserRole.PATIENT,
  )
  findAll() {
    return this.doctorsService.findAll();
  }

  @Get(':id')
  @Roles(
    UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST,
    UserRole.NURSE, UserRole.PATIENT,
  )
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDoctorDto,
  ) {
    return this.doctorsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.remove(id);
  }
}
