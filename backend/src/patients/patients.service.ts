
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../prisma/prisma.service.js';
import { UserRole } from '../generated/prisma/client.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';

interface AuthenticatedUser {
  sub?: number | string;
  id?: number | string;
  userId?: number | string;
  role: UserRole;
}

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  // Resolve the authenticated user's database ID.
  private getAuthenticatedUserId(user: AuthenticatedUser): number {
    const rawId = user.sub ?? user.userId ?? user.id;
    const userId = Number(rawId);

    if (
      rawId === undefined ||
      rawId === null ||
      !Number.isSafeInteger(userId) ||
      userId <= 0
    ) {
      throw new ForbiddenException(
        'Invalid authenticated user information',
      );
    }

    return userId;
  }

  // CREATE PATIENT
  async create(createPatientDto: CreatePatientDto) {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      emergencyPhone,
      allergies,
      medicalHistory,
    } = createPatientDto;

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException(
        'A user with this email already exists',
      );
    }

    const parsedDate = new Date(dateOfBirth);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new ConflictException('Invalid date of birth');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const patient = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email: normalizedEmail,
          passwordHash,
          phone,
          role: UserRole.PATIENT,
          isActive: true,
        },
      });

      return tx.patient.create({
        data: {
          userId: user.id,
          dateOfBirth: parsedDate,
          gender,
          bloodGroup,
          address,
          emergencyContact,
          emergencyPhone,
          allergies,
          medicalHistory,
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
        },
      });
    });

    return {
      message: 'Patient created successfully',
      patient,
    };
  }

  // GET ALL PATIENTS
  // Controller RBAC restricts this operation to authorized staff.
  async findAll() {
    return this.prisma.patient.findMany({
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // GET PATIENT BY ID
  async findOne(id: number, currentUser: AuthenticatedUser) {
    const patient = await this.prisma.patient.findUnique({
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
        appointments: true,
        medicalRecords: true,
        prescriptions: true,
        invoices: true,
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Patients may access only their own patient record.
    if (currentUser.role === UserRole.PATIENT) {
      const authenticatedUserId =
        this.getAuthenticatedUserId(currentUser);

      if (patient.userId !== authenticatedUserId) {
        throw new ForbiddenException(
          'You can only access your own patient record',
        );
      }
    }

    return patient;
  }

  // UPDATE PATIENT
  async update(
    id: number,
    updatePatientDto: UpdatePatientDto,
    currentUser: AuthenticatedUser,
  ) {
    const existingPatient = await this.prisma.patient.findUnique({
      where: { id },
    });

    if (!existingPatient) {
      throw new NotFoundException('Patient not found');
    }

    const isAdmin = currentUser.role === UserRole.ADMIN;
    const isPatient = currentUser.role === UserRole.PATIENT;

    if (!isAdmin && !isPatient) {
      throw new ForbiddenException(
        'You are not allowed to update patient records',
      );
    }

    // Patients can update only their own record.
    if (isPatient) {
      const authenticatedUserId =
        this.getAuthenticatedUserId(currentUser);

      if (existingPatient.userId !== authenticatedUserId) {
        throw new ForbiddenException(
          'You can only update your own patient record',
        );
      }
    }

    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      emergencyPhone,
      allergies,
      medicalHistory,
    } = updatePatientDto;

    // Patients can update basic contact/profile fields only.
    // Clinical and demographic fields are restricted to administrators.
    const patientProfileData = isAdmin
      ? {
          firstName,
          lastName,
          phone,
          dateOfBirth: dateOfBirth
            ? new Date(dateOfBirth)
            : undefined,
          gender,
          bloodGroup,
          address,
          emergencyContact,
          emergencyPhone,
          allergies,
          medicalHistory,
        }
      : {
          firstName,
          lastName,
          phone,
          address,
          emergencyContact,
          emergencyPhone,
        };

    if (
      isAdmin &&
      dateOfBirth &&
      Number.isNaN(new Date(dateOfBirth).getTime())
    ) {
      throw new ConflictException('Invalid date of birth');
    }

    const patient = await this.prisma.$transaction(async (tx) => {
      const userData = {
        firstName: patientProfileData.firstName,
        lastName: patientProfileData.lastName,
        phone: patientProfileData.phone,
      };

      await tx.user.update({
        where: { id: existingPatient.userId },
        data: userData,
      });

      return tx.patient.update({
        where: { id },
        data: {
          ...(isAdmin
            ? {
                dateOfBirth: dateOfBirth
                  ? new Date(dateOfBirth)
                  : undefined,
                gender,
                bloodGroup,
                allergies,
                medicalHistory,
              }
            : {}),
          address: patientProfileData.address,
          emergencyContact: patientProfileData.emergencyContact,
          emergencyPhone: patientProfileData.emergencyPhone,
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
        },
      });
    });

    return {
      message: 'Patient updated successfully',
      patient,
    };
  }

  // DELETE PATIENT
  // Controller RBAC allows only administrators to call this method.
  async remove(id: number) {
    const existingPatient = await this.prisma.patient.findUnique({
      where: { id },
    });

    if (!existingPatient) {
      throw new NotFoundException('Patient not found');
    }

    // Preserve referential integrity by deleting both records
    // in a single transaction. Related medical records or invoices
    // may prevent deletion when foreign-key constraints exist.
    await this.prisma.$transaction(async (tx) => {
      await tx.patient.delete({
        where: { id },
      });

      await tx.user.delete({
        where: { id: existingPatient.userId },
      });
    });

    return {
      message: 'Patient deleted successfully',
    };
  }
}