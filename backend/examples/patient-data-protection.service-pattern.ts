/*
 * Pattern only — adapt to the real service and generated Prisma types.
 * Never copy this into an unrelated service without matching the model fields.
 */
import { ForbiddenException, NotFoundException } from '@nestjs/common';

// In a service method, first resolve the authenticated user's Patient record:
async function resolveOwnPatientId(prisma: any, authenticatedUserId: number) {
  const patient = await prisma.patient.findUnique({
    where: { userId: authenticatedUserId },
    select: { id: true },
  });

  if (!patient) {
    throw new NotFoundException('Patient profile not found');
  }

  return patient.id;
}

// Then filter reads using BOTH resource ID and patient ownership:
async function findOwnInvoice(prisma: any, invoiceId: number, patientId: number) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, patientId },
    include: { payments: true },
  });

  if (!invoice) {
    // Returning 404 avoids confirming another patient's invoice exists.
    throw new NotFoundException('Invoice not found');
  }

  return invoice;
}

// For an update, verify the relation before modifying anything:
async function assertDoctorOwnsAppointment(
  prisma: any,
  appointmentId: number,
  authenticatedUserId: number,
) {
  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      doctor: { userId: authenticatedUserId },
    },
    select: { id: true },
  });

  if (!appointment) {
    throw new ForbiddenException(
      'You are not authorized to access this appointment',
    );
  }
}

/*
 * These functions are illustrative snippets, not a standalone NestJS service.
 * Replace `any` with your PrismaService type and integrate the checks into
 * every relevant query/update/delete. Do not rely on role decorators alone.
 */
