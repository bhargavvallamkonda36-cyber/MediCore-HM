/**
 * E2E TEST STARTER — adapt to your actual login route and test users.
 * Keep this as an example until the endpoint and credentials are wired in.
 * Requires the project's existing Nest Jest/Supertest setup.
 */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('RBAC (e2e starter)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('rejects requests to protected doctor routes without a token', async () => {
    await request(app.getHttpServer()).get('/doctors').expect(401);
  });

  it.todo('allows ADMIN to create a doctor using a valid test token');
  it.todo('rejects DOCTOR/RECEPTIONIST from creating a doctor with 403');
  it.todo('allows intended staff roles to read doctor listings');
});
