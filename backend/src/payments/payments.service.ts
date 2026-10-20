import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { UpdatePaymentDto } from './dto/update-payment.dto.js';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  private async updateInvoiceStatus(invoiceId: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });

    if (!invoice) return;

    const paidAmount = invoice.payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    let status: 'PENDING' | 'PARTIAL' | 'PAID' = 'PENDING';

    if (paidAmount >= Number(invoice.totalAmount)) {
      status = 'PAID';
    } else if (paidAmount > 0) {
      status = 'PARTIAL';
    }

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { paidAmount, status },
    });
  }

  async create(dto: CreatePaymentDto) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: dto.invoiceId },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');
    if (dto.amount <= 0) {
      throw new BadRequestException(
        'Payment amount must be greater than zero',
      );
    }

    const payment = await this.prisma.payment.create({
      data: {
        invoiceId: dto.invoiceId,
        amount: dto.amount,
        method: dto.method,
        transactionId: dto.transactionId,
      },
    });

    await this.updateInvoiceStatus(dto.invoiceId);

    return { message: 'Payment created successfully', payment };
  }

  async findAll() {
    return this.prisma.payment.findMany({
      orderBy: { paymentDate: 'desc' },
      include: {
        invoice: {
          include: {
            patient: { include: { user: true } },
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            patient: { include: { user: true } },
          },
        },
      },
    });

    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async update(id: number, dto: UpdatePaymentDto) {
    const payment = await this.findOne(id);

    if (dto.amount !== undefined && dto.amount <= 0) {
      throw new BadRequestException(
        'Payment amount must be greater than zero',
      );
    }

    const updated = await this.prisma.payment.update({
      where: { id },
      data: {
        amount: dto.amount,
        method: dto.method,
        transactionId: dto.transactionId,
      },
    });

    await this.updateInvoiceStatus(payment.invoiceId);

    return { message: 'Payment updated successfully', payment: updated };
  }

  async remove(id: number) {
    const payment = await this.findOne(id);

    await this.prisma.payment.delete({ where: { id } });
    await this.updateInvoiceStatus(payment.invoiceId);

    return { message: 'Payment deleted successfully' };
  }
}
