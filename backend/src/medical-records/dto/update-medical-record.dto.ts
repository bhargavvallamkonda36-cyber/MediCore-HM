import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

import { RecordType } from '../../generated/prisma/client.js';

export class UpdateMedicalRecordDto {
  @IsOptional()
  @IsInt()
  appointmentId?: number;

  @IsOptional()
  @IsEnum(RecordType)
  recordType?: RecordType;

  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  symptoms?: string;

  @IsOptional()
  @IsString()
  treatment?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
