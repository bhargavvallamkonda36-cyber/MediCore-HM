import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateInvoiceDto } from './dto/create-invoice.dto.js';
import { UpdateInvoiceDto } from './dto/update-invoice.dto.js';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateTotal(dto: {
    consultationFee?: number;
    medicationFee?: number;
    labFee?: number;
    otherCharges?: number;
    discount?: number;
  }) {
    return (
      (dto.consultationFee ?? 0) +
      (dto.medicationFee ?? 0) +
      (dto.labFee ?? 0) +
      (dto.otherCharges ?? 0) -
      (dto.discount ?? 0)
    );
  }

  async create(dto: CreateInvoiceDto) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    if (dto.appointmentId) {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: dto.appointmentId },
      });
      if (!appointment) throw new NotFoundException('Appointment not found');

      const existing = await this.prisma.invoice.findUnique({
        where: { appointmentId: dto.appointmentId },
      });
      if (existing) {
        throw new ConflictException(
          'Invoice already exists for this appointment',
        );
      }
    }

    const totalAmount = this.calculateTotal(dto);

    return {
      message: 'Invoice created successfully',
      invoice: await this.prisma.invoice.create({
        data: {
          patientId: dto.patientId,
          appointmentId: dto.appointmentId,
          invoiceNumber: `INV-${Date.now()}`,
          consultationFee: dto.consultationFee ?? 0,
          medicationFee: dto.medicationFee ?? 0,
          labFee: dto.labFee ?? 0,
          otherCharges: dto.otherCharges ?? 0,
          discount: dto.discount ?? 0,
          totalAmount,
        },
        include: {
          patient: { include: { user: true } },
          appointment: true,
          payments: true,
        },
      }),
    };
  }

  async findAll() {
    return this.prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { include: { user: true } },
        appointment: true,
        payments: true,
      },
    });
  }

  async findOne(id: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        appointment: true,
        payments: true,
      },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async update(id: number, dto: UpdateInvoiceDto) {
    const invoice = await this.findOne(id);

    const data = {
      consultationFee:
        dto.consultationFee ?? Number(invoice.consultationFee),
      medicationFee:
        dto.medicationFee ?? Number(invoice.medicationFee),
      labFee: dto.labFee ?? Number(invoice.labFee),
      otherCharges: dto.otherCharges ?? Number(invoice.otherCharges),
      discount: dto.discount ?? Number(invoice.discount),
    };

    return {
      message: 'Invoice updated successfully',
      invoice: await this.prisma.invoice.update({
        where: { id },
        data: {
          ...data,
          totalAmount: this.calculateTotal(data),
        },
      }),
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.invoice.delete({ where: { id } });
    return { message: 'Invoice deleted successfully' };
  }
}
