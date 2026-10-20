import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { MedicationsController } from './medications.controller.js';
import { MedicationsService } from './medications.service.js';

@Module({
  imports: [AuthModule],
  controllers: [MedicationsController],
  providers: [MedicationsService],
})
export class MedicationsModule {}
