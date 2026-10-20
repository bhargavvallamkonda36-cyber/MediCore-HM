
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateDoctorDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  firstName?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  departmentId?: number;

  @IsString()
  @IsOptional()
  specialization?: string;

  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  experienceYears?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  consultationFee?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
