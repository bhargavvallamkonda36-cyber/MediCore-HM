import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../prisma/prisma.service.js';

import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // =========================
  // REGISTER
  // =========================

  async register(registerDto: RegisterDto) {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
    } = registerDto;

    const normalizedEmail =
      email.toLowerCase().trim();

    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    if (existingUser) {
      throw new ConflictException(
        'Email is already registered',
      );
    }

    const passwordHash =
      await bcrypt.hash(password, 12);

    const user =
      await this.prisma.user.create({
        data: {
          firstName,
          lastName,
          email: normalizedEmail,
          passwordHash,
          phone,
          role: 'PATIENT',
          isActive: true,
        },
      });

    const tokens =
      await this.generateTokens(
        user.id,
        user.email,
        user.role,
      );

    return {
      message: 'Registration successful',

      ...tokens,

      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }

  // =========================
  // LOGIN
  // =========================

  async login(loginDto: LoginDto) {
    const email =
      loginDto.email
        .toLowerCase()
        .trim();

    const user =
      await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Your account is inactive',
      );
    }

    const passwordMatches =
      await bcrypt.compare(
        loginDto.password,
        user.passwordHash,
      );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const tokens =
      await this.generateTokens(
        user.id,
        user.email,
        user.role,
      );

    return {
      message: 'Login successful',

      ...tokens,

      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }

  // =========================
  // GET PROFILE
  // =========================

  async getProfile(userId: number) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },

        include: {
          doctor: {
            include: {
              department: true,
            },
          },

          patient: true,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'User not found',
      );
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      doctor: user.doctor,
      patient: user.patient,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // =========================
  // REFRESH TOKEN
  // =========================

  async refreshToken(
    refreshToken: string,
  ) {
    try {
      const payload =
        await this.jwtService.verifyAsync(
          refreshToken,
          {
            secret:
              process.env
                .JWT_REFRESH_SECRET ||
              'medicore_refresh_secret_change_this_later',
          },
        );

      const user =
        await this.prisma.user.findUnique({
          where: {
            id: payload.sub,
          },
        });

      if (!user || !user.isActive) {
        throw new UnauthorizedException(
          'Invalid refresh token',
        );
      }

      const tokens =
        await this.generateTokens(
          user.id,
          user.email,
          user.role,
        );

      return {
        message:
          'Token refreshed successfully',

        ...tokens,
      };
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired refresh token',
      );
    }
  }

  // =========================
  // GENERATE TOKENS
  // =========================

  private async generateTokens(
    userId: number,
    email: string,
    role: string,
  ) {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const accessToken =
      await this.jwtService.signAsync(
        payload,
        {
          secret:
            process.env.JWT_SECRET ||
            'medicore_super_secret_change_this_later',

          expiresIn: '15m',
        },
      );

    const refreshToken =
      await this.jwtService.signAsync(
        payload,
        {
          secret:
            process.env
              .JWT_REFRESH_SECRET ||
            'medicore_refresh_secret_change_this_later',

          expiresIn: '7d',
        },
      );

    return {
      accessToken,
      refreshToken,
    };
  }
}
