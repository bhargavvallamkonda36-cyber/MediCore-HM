import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../generated/prisma/client.js';

export const ROLES_KEY_LOCAL = 'roles';

interface AuthenticatedUser {
  id?: number | string;
  sub?: number | string;
  email?: string;
  role?: UserRole;
}

interface AuthenticatedRequest {
  user?: AuthenticatedUser;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY_LOCAL,
      [context.getHandler(), context.getClass()],
    );

    // No role metadata means this guard does not add a role restriction.
    // Authentication must still be enforced by JwtAuthGuard.
    if (!requiredRoles?.length) return true;

    const request =
      context.switchToHttp().getRequest<AuthenticatedRequest>();
    const role = request.user?.role;

    if (!role) {
      throw new ForbiddenException('User role information is missing');
    }

    if (!requiredRoles.includes(role)) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
