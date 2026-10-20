import {
Body,
Controller,
Delete,
Get,
Param,
ParseIntPipe,
Patch,
Post,
UseGuards,
} from '@nestjs/common';

import { UserRole } from '../generated/prisma/client.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { Roles } from '../guards/roles.decorator.js';

import { CreateDoctorDto } from './dto/create-doctor.dto.js';
import { UpdateDoctorDto } from './dto/update-doctor.dto.js';
import { DoctorsService } from './doctors.service.js';

@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorsController {
constructor(
private readonly doctorsService: DoctorsService,
) {}

// Only administrators can create doctor records.
@Post()
@Roles(UserRole.ADMIN)
create(@Body() createDoctorDto: CreateDoctorDto) {
return this.doctorsService.create(createDoctorDto);
}

// Authorized users can view the doctor directory.
@Get()
@Roles(
UserRole.ADMIN,
UserRole.DOCTOR,
UserRole.RECEPTIONIST,
UserRole.NURSE,
UserRole.PATIENT,
)
findAll() {
return this.doctorsService.findAll();
}

// Authorized users can view an individual doctor record.
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
) {
return this.doctorsService.findOne(id);
}

// Only administrators can update doctor records.
@Patch(':id')
@Roles(UserRole.ADMIN)
update(
@Param('id', ParseIntPipe) id: number,
@Body() updateDoctorDto: UpdateDoctorDto,
) {
return this.doctorsService.update(
id,
updateDoctorDto,
);
}

// Only administrators can delete doctor records.
@Delete(':id')
@Roles(UserRole.ADMIN)
remove(
@Param('id', ParseIntPipe) id: number,
) {
return this.doctorsService.remove(id);
}
}