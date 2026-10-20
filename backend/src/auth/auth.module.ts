import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PrismaModule } from '../prisma/prisma.module.js';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

@Module({
  imports: [
    PrismaModule,

    JwtModule.register({
      secret:
        process.env.JWT_SECRET ||
        'medicore_super_secret_change_this_later',

      signOptions: {
        expiresIn: '15m',
      },
    }),
  ],

  controllers: [AuthController],

  providers: [AuthService],

  exports: [
    AuthService,
    JwtModule,
  ],
})
export class AuthModule {}
