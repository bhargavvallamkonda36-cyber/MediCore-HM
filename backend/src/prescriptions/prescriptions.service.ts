import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePrescriptionDto } from './dto/create-prescription.dto.js';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto.js';

@Injectable()
export class PrescriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePrescriptionDto) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const doctor = await this.prisma.doctor.findUnique({
      where: { id: dto.doctorId },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    return {
      message: 'Prescription created successfully',
      prescription: await this.prisma.prescription.create({
        data: {
          patientId: dto.patientId,
          doctorId: dto.doctorId,
          diagnosis: dto.diagnosis,
          instructions: dto.instructions,
          items: {
            create: dto.items.map((item) => ({
              medicationId: item.medicationId,
              dosage: item.dosage,
              frequency: item.frequency,
              duration: item.duration,
              instructions: item.instructions,
            })),
          },
        },
        include: {
          patient: { include: { user: true } },
          doctor: { include: { user: true } },
          items: { include: { medication: true } },
        },
      }),
    };
  }

  async findAll() {
    return this.prisma.prescription.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        items: { include: { medication: true } },
      },
    });
  }

  async findOne(id: number) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        items: { include: { medication: true } },
      },
    });

    if (!prescription) throw new NotFoundException('Prescription not found');
    return prescription;
  }

  async update(id: number, dto: UpdatePrescriptionDto) {
    await this.findOne(id);

    if (dto.items) {
      await this.prisma.prescriptionItem.deleteMany({
        where: { prescriptionId: id },
      });
    }

    return {
      message: 'Prescription updated successfully',
      prescription: await this.prisma.prescription.update({
        where: { id },
        data: {
          diagnosis: dto.diagnosis,
          instructions: dto.instructions,
          ...(dto.items
            ? {
                items: {
                  create: dto.items.map((item) => ({
                    medicationId: item.medicationId,
                    dosage: item.dosage,
                    frequency: item.frequency,
                    duration: item.duration,
                    instructions: item.instructions,
                  })),
                },
              }
            : {}),
        },
        include: {
          items: { include: { medication: true } },
        },
      }),
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.prescription.delete({ where: { id } });
    return { message: 'Prescription deleted successfully' };
  }
}
