import {
IsArray,
IsInt,
IsNotEmpty,
IsOptional,
IsString,
ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

export class PrescriptionItemDto {
@Type(() => Number)
@IsInt()
medicationId: number;

@IsString()
@IsNotEmpty()
dosage: string;

@IsString()
@IsNotEmpty()
frequency: string;

@IsString()
@IsNotEmpty()
duration: string;

@IsOptional()
@IsString()
instructions?: string;
}

export class CreatePrescriptionDto {
@Type(() => Number)
@IsInt()
patientId: number;

@Type(() => Number)
@IsInt()
doctorId: number;

@IsOptional()
@IsString()
diagnosis?: string;

@IsOptional()
@IsString()
instructions?: string;

@IsOptional()
@IsArray()
@ValidateNested({ each: true })
@Type(() => PrescriptionItemDto)
items?: PrescriptionItemDto[];
}
