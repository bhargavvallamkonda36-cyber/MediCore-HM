import {
CanActivate,
ExecutionContext,
Injectable,
UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
constructor(
private readonly jwtService: JwtService,
) {}

canActivate(
context: ExecutionContext,
): boolean {
const request = context.switchToHttp().getRequest();


const authorization = request.headers.authorization;

if (
  !authorization ||
  typeof authorization !== 'string'
) {
  throw new UnauthorizedException(
    'Authorization token is required',
  );
}

const [type, token, ...extraParts] = authorization.split(' ');

if (
  type !== 'Bearer' ||
  !token ||
  extraParts.length > 0
) {
  throw new UnauthorizedException(
    'Invalid authorization format',
  );
}

try {
  const payload = this.jwtService.verify(token);

  request.user = payload;

  return true;
} catch {
  throw new UnauthorizedException(
    'Invalid or expired token',
  );
}

}
}
