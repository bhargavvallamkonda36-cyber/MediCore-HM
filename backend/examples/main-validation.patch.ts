// Merge into existing src/main.ts bootstrap; do not replace your file blindly.
import { ValidationPipe } from '@nestjs/common';

// After creating the Nest app:
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);

// Keep your existing CORS, prefix, Swagger, and listen setup as-is.
