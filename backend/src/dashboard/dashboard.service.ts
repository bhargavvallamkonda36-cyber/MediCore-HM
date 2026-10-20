import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
constructor(private readonly prisma: PrismaService) {}

async getOverview() {
const [
totalPatients,
totalDoctors,
totalAppointments,
totalDepartments,
totalInvoices,
totalPayments,
invoices,
recentAppointments,
recentPayments,
] = await Promise.all([
this.prisma.patient.count(),
this.prisma.doctor.count(),
this.prisma.appointment.count(),
this.prisma.department.count(),
this.prisma.invoice.count(),
this.prisma.payment.count(),

  this.prisma.invoice.findMany({
    select: {
      totalAmount: true,
      paidAmount: true,
      status: true,
    },
  }),

  this.prisma.appointment.findMany({
    take: 5,
    orderBy: { appointmentDate: 'desc' },
    include: {
      patient: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      doctor: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  }),

  this.prisma.payment.findMany({
    take: 5,
    orderBy: { paymentDate: 'desc' },
    include: {
      invoice: {
        select: {
          invoiceNumber: true,
        },
      },
    },
  }),
]);

const totalRevenue = invoices.reduce(
  (sum, invoice) => sum + Number(invoice.totalAmount),
  0,
);

const totalPaid = invoices.reduce(
  (sum, invoice) => sum + Number(invoice.paidAmount),
  0,
);

const outstandingBalance = invoices.reduce(
  (sum, invoice) =>
    sum +
    Math.max(
      0,
      Number(invoice.totalAmount) - Number(invoice.paidAmount),
    ),
  0,
);

return {
  statistics: {
    totalPatients,
    totalDoctors,
    totalAppointments,
    totalDepartments,
    totalInvoices,
    totalPayments,
  },

  finances: {
    totalRevenue,
    totalPaid,
    outstandingBalance,
  },

  recentAppointments,
  recentPayments,
};

}
}
