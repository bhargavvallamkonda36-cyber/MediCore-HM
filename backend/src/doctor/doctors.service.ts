
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDoctorDto } from './dto/create-doctor.dto.js';
import { UpdateDoctorDto } from './dto/update-doctor.dto.js';

@Injectable()
export class DoctorsService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // CREATE DOCTOR
  // ==========================================
  async create(createDoctorDto: CreateDoctorDto) {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      departmentId,
      specialization,
      licenseNumber,
      experienceYears,
      consultationFee,
    } = createDoctorDto;

    // Check whether the email already exists.
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Check whether the license number already exists.
    const existingDoctor = await this.prisma.doctor.findUnique({
      where: { licenseNumber },
    });

    if (existingDoctor) {
      throw new ConflictException('License number already exists');
    }

    // Verify the department exists.
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // Hash the doctor's password.
    const passwordHash = await bcrypt.hash(password, 10);

    // Create the user and doctor in one transaction.
    const doctor = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          passwordHash,
          phone,
          role: 'DOCTOR',
          isActive: true,
        },
      });

      return tx.doctor.create({
        data: {
          userId: user.id,
          departmentId,
          specialization,
          licenseNumber,
          experienceYears,
          consultationFee,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              role: true,
              isActive: true,
            },
          },
          department: true,
        },
      });
    });

    return {
      message: 'Doctor created successfully',
      doctor,
    };
  }

  // ==========================================
  // GET ALL DOCTORS
  // ==========================================
  async findAll() {
    return this.prisma.doctor.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
          },
        },
        department: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  // ==========================================
  // GET DOCTOR BY ID
  // ==========================================
  async findOne(id: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
          },
        },
        department: true,
        appointments: true,
        medicalRecords: true,
        prescriptions: true,
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  // ==========================================
  // UPDATE DOCTOR
  // Supports profile updates and isActive toggle.
  // ==========================================
  async update(id: number, updateDoctorDto: UpdateDoctorDto) {
    const existingDoctor = await this.prisma.doctor.findUnique({
      where: { id },
    });

    if (!existingDoctor) {
      throw new NotFoundException('Doctor not found');
    }

    const {
      firstName,
      lastName,
      phone,
      departmentId,
      specialization,
      licenseNumber,
      experienceYears,
      consultationFee,
      isActive,
    } = updateDoctorDto;

    // Validate the department if it is being changed.
    if (departmentId !== undefined) {
      const department = await this.prisma.department.findUnique({
        where: { id: departmentId },
      });

      if (!department) {
        throw new NotFoundException('Department not found');
      }
    }

    // Prevent duplicate license numbers.
    if (
      licenseNumber !== undefined &&
      licenseNumber !== existingDoctor.licenseNumber
    ) {
      const licenseExists = await this.prisma.doctor.findUnique({
        where: { licenseNumber },
      });

      if (licenseExists) {
        throw new ConflictException('License number already exists');
      }
    }

    // Update the user and doctor records atomically.
    const doctor = await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: existingDoctor.userId,
        },
        data: {
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(phone !== undefined && { phone }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      return tx.doctor.update({
        where: { id },
        data: {
          ...(departmentId !== undefined && { departmentId }),
          ...(specialization !== undefined && { specialization }),
          ...(licenseNumber !== undefined && { licenseNumber }),
          ...(experienceYears !== undefined && { experienceYears }),
          ...(consultationFee !== undefined && { consultationFee }),
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              role: true,
              isActive: true,
            },
          },
          department: true,
        },
      });
    });

    return {
      message: 'Doctor updated successfully',
      doctor,
    };
  }

  // ==========================================
  // DELETE DOCTOR
  // ==========================================
  async remove(id: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Deleting the user also deletes the linked doctor
    // because the schema specifies onDelete: Cascade.
    await this.prisma.user.delete({
      where: {
        id: doctor.userId,
      },
    });

    return {
      message: 'Doctor deleted successfully',
    };
  }
}
