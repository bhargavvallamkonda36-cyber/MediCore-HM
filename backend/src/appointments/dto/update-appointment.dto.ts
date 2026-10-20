import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';

import {
  AppointmentStatus,
  AppointmentType,
} from '../../generated/prisma/client.js';

export class UpdateAppointmentDto {
  @IsDateString()
  @IsOptional()
  appointmentDate?: string;

  @IsEnum(AppointmentType)
  @IsOptional()
  type?: AppointmentType;

  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  reason?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
