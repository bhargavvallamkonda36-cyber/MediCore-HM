import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    const { name, description, location } = createDepartmentDto;

    const existingDepartment = await this.prisma.department.findUnique({
      where: {
        name,
      },
    });

    if (existingDepartment) {
      throw new ConflictException(
        'Department with this name already exists',
      );
    }

    return this.prisma.department.create({
      data: {
        name,
        description,
        location,
      },
    });
  }

  async findAll() {
    return this.prisma.department.findMany({
      include: {
        _count: {
          select: {
            doctors: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const department = await this.prisma.department.findUnique({
      where: {
        id,
      },
      include: {
        doctors: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async update(
    id: number,
    updateDepartmentDto: UpdateDepartmentDto,
  ) {
    const existingDepartment =
      await this.prisma.department.findUnique({
        where: {
          id,
        },
      });

    if (!existingDepartment) {
      throw new NotFoundException('Department not found');
    }

    if (
      updateDepartmentDto.name &&
      updateDepartmentDto.name !== existingDepartment.name
    ) {
      const duplicateDepartment =
        await this.prisma.department.findUnique({
          where: {
            name: updateDepartmentDto.name,
          },
        });

      if (duplicateDepartment) {
        throw new ConflictException(
          'Department with this name already exists',
        );
      }
    }

    return this.prisma.department.update({
      where: {
        id,
      },
      data: updateDepartmentDto,
    });
  }

  async remove(id: number) {
    const department = await this.prisma.department.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            doctors: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    if (department._count.doctors > 0) {
      throw new ConflictException(
        'Cannot delete a department that has doctors assigned to it',
      );
    }

    await this.prisma.department.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Department deleted successfully',
    };
  }
}
