import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMedicationDto } from './dto/create-medication.dto.js';
import { UpdateMedicationDto } from './dto/update-medication.dto.js';

@Injectable()
export class MedicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMedicationDto) {
    const existing = await this.prisma.medication.findFirst({
      where: {
        name: {
          equals: dto.name,
          mode: 'insensitive',
        },
      },
    });

    if (existing) throw new ConflictException('Medication already exists');

    return {
      message: 'Medication created successfully',
      medication: await this.prisma.medication.create({ data: dto }),
    };
  }

  async findAll() {
    return this.prisma.medication.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const medication = await this.prisma.medication.findUnique({
      where: { id },
      include: { prescriptionItems: true },
    });

    if (!medication) throw new NotFoundException('Medication not found');
    return medication;
  }

  async update(id: number, dto: UpdateMedicationDto) {
    await this.findOne(id);

    return {
      message: 'Medication updated successfully',
      medication: await this.prisma.medication.update({
        where: { id },
        data: dto,
      }),
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.medication.delete({ where: { id } });
    return { message: 'Medication deleted successfully' };
  }
}
