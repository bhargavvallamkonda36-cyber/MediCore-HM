import {
  IsInt,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateInvoiceDto {
  @IsInt()
  patientId: number;

  @IsOptional()
  @IsInt()
  appointmentId?: number;

  @IsOptional()
  @IsNumber()
  consultationFee?: number;

  @IsOptional()
  @IsNumber()
  medicationFee?: number;

  @IsOptional()
  @IsNumber()
  labFee?: number;

  @IsOptional()
  @IsNumber()
  otherCharges?: number;

  @IsOptional()
  @IsNumber()
  discount?: number;
}
