
import { NestFactory } from '@nestjs/core';
import type { CorsOptions } from 'cors';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Allowed frontend origins
  const allowedOrigins: string[] = [
    'https://medi-core-hm.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  // Read the production frontend URL from environment variables.
  const configuredFrontendUrl = process.env.FRONTEND_URL?.trim();

  if (configuredFrontendUrl) {
    const normalizedUrl = configuredFrontendUrl.replace(/\/+$/, '');

    if (!allowedOrigins.includes(normalizedUrl)) {
      allowedOrigins.push(normalizedUrl);
    }
  }

  // Configure CORS with explicit TypeScript types.
  const corsOptions: CorsOptions = {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ): void => {
      // Permit requests without an Origin header.
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = origin.replace(/\/+$/, '');

      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Origin not allowed by CORS'), false);
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  };

  app.enableCors(corsOptions);

  // Render supplies PORT automatically.
  const port = Number(process.env.PORT) || 4000;

  // Listen on all network interfaces.
  await app.listen(port, '0.0.0.0');

  console.log(`MediCore API running on port ${port}`);
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start MediCore API:', error);
  process.exit(1);
});