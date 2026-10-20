import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { UpdateAppointmentDto } from './dto/update-appointment.dto.js';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAppointmentDto) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const doctor = await this.prisma.doctor.findUnique({
      where: { id: dto.doctorId },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const appointmentDate = new Date(dto.appointmentDate);
    if (Number.isNaN(appointmentDate.getTime())) {
      throw new ConflictException('Invalid appointment date');
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        appointmentDate,
        type: dto.type,
        status: dto.status,
        reason: dto.reason,
        notes: dto.notes,
      },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true, department: true } },
      },
    });

    return { message: 'Appointment created successfully', appointment };
  }

  async findAll() {
    return this.prisma.appointment.findMany({
      orderBy: { appointmentDate: 'desc' },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true, department: true } },
        medicalRecord: true,
        invoice: true,
      },
    });
  }

  async findOne(id: number) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true, department: true } },
        medicalRecord: true,
        invoice: true,
      },
    });

    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async update(id: number, dto: UpdateAppointmentDto) {
    await this.findOne(id);

    const data: any = {
      reason: dto.reason,
      notes: dto.notes,
      type: dto.type,
      status: dto.status,
    };

    if (dto.appointmentDate) {
      const appointmentDate = new Date(dto.appointmentDate);
      if (Number.isNaN(appointmentDate.getTime())) {
        throw new ConflictException('Invalid appointment date');
      }
      data.appointmentDate = appointmentDate;
    }

    return {
      message: 'Appointment updated successfully',
      appointment: await this.prisma.appointment.update({
        where: { id },
        data,
        include: {
          patient: { include: { user: true } },
          doctor: { include: { user: true, department: true } },
        },
      }),
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.appointment.delete({ where: { id } });
    return { message: 'Appointment deleted successfully' };
  }
}
