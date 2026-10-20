import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { PaymentMethod } from '../../generated/prisma/client.js';

export class CreatePaymentDto {
  @IsInt()
  invoiceId: number;

  @IsNumber()
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsOptional()
  @IsString()
  transactionId?: string;
}
