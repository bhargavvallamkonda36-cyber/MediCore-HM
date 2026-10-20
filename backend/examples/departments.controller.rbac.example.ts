/**
 * EXAMPLE ONLY. Merge decorators into your existing controller; do not replace it.
 * Keep your current service calls and all existing routes.
 */
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { UserRole } from '../generated/prisma/client.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { Roles } from '../guards/roles.decorator.js';

@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentsControllerRbacExample {
  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.NURSE)
  findAll() {
    return { note: 'Use your existing departmentsService.findAll() here.' };
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() body: unknown) {
    return { note: 'Use your existing departmentsService.create(body) here.' };
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() body: unknown) {
    return { note: 'Use your existing departmentsService.update(id, body) here.' };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return { note: 'Use your existing departmentsService.remove(id) here.' };
  }
}
