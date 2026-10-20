import { Module } from '@nestjs/common';

import { AppointmentsModule } from './appointments/appointments.module.js';
import { AuthModule } from './auth/auth.module.js';
import { DepartmentsModule } from './departments/departments.module.js';
import { DoctorsModule } from './doctor/doctors.module.js';
import { InvoicesModule } from './invoices/invoices.module.js';
import { MedicalRecordsModule } from './medical-records/medical-records.module.js';
import { MedicationsModule } from './medications/medications.module.js';
import { PatientsModule } from './patients/patients.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { PrescriptionsModule } from './prescriptions/prescriptions.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    DepartmentsModule,
    PatientsModule,
    DoctorsModule,
    AppointmentsModule,
    MedicalRecordsModule,
    MedicationsModule,
    PrescriptionsModule,
    InvoicesModule,
    PaymentsModule,
  ],
})
export class AppModule {}
