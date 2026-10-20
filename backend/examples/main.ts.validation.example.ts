/**
 * Optional: merge into your existing main.ts inside bootstrap(), before app.listen().
 * Preserve all existing app setup.
 */
import { ValidationPipe } from '@nestjs/common';

app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
