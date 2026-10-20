import {
  IsNumber,
  IsOptional,
} from 'class-validator';

export class UpdateInvoiceDto {
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
