import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto.js';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto.js';

@Injectable()
export class MedicalRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMedicalRecordDto) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const doctor = await this.prisma.doctor.findUnique({
      where: { id: dto.doctorId },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    return {
      message: 'Medical record created successfully',
      medicalRecord: await this.prisma.medicalRecord.create({
        data: {
          patientId: dto.patientId,
          doctorId: dto.doctorId,
          appointmentId: dto.appointmentId,
          recordType: dto.recordType,
          diagnosis: dto.diagnosis,
          symptoms: dto.symptoms,
          treatment: dto.treatment,
          notes: dto.notes,
        },
        include: {
          patient: { include: { user: true } },
          doctor: { include: { user: true, department: true } },
          appointment: true,
        },
      }),
    };
  }

  async findAll() {
    return this.prisma.medicalRecord.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true, department: true } },
        appointment: true,
      },
    });
  }

  async findOne(id: number) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true, department: true } },
        appointment: true,
      },
    });

    if (!record) throw new NotFoundException('Medical record not found');
    return record;
  }

  async update(id: number, dto: UpdateMedicalRecordDto) {
    await this.findOne(id);

    return {
      message: 'Medical record updated successfully',
      medicalRecord: await this.prisma.medicalRecord.update({
        where: { id },
        data: dto,
      }),
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.medicalRecord.delete({ where: { id } });
    return { message: 'Medical record deleted successfully' };
  }
}
