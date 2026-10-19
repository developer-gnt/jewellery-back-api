import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor.js';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter.js';
import { App } from 'supertest/types.js';

describe('Admin CMS APIs (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('1. POST /api/v1/admin/auth/login', () => {
    it('should reject invalid credentials with 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/auth/login')
        .send({
          email: 'admin@zewarmahal.com',
          password: 'WrongPassword123',
        })
        .expect(401);

      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should login successfully with default seeded admin credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/auth/login')
        .send({
          email: 'admin@zewarmahal.com',
          password: 'Admin@123456',
        })
        .expect(200);

      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.admin).toMatchObject({
        email: 'admin@zewarmahal.com',
        role: 'admin',
        name: 'Admin',
      });

      accessToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
    });
  });

  describe('2. GET /api/v1/admin/auth/me', () => {
    it('should return 401 when access token is missing', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/auth/me')
        .expect(401);

      expect(res.body.message).toBe('Access token is required');
    });

    it('should return admin profile when valid token provided', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data).toMatchObject({
        email: 'admin@zewarmahal.com',
        role: 'admin',
        isActive: true,
      });
      expect(res.body.data).not.toHaveProperty('password');
    });
  });

  describe('3. GET /api/v1/admin/dashboard', () => {
    it('should retrieve CMS dashboard statistics', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data).toMatchObject({
        totalUsers: expect.any(Number),
        totalProducts: expect.any(Number),
        totalEnquiries: expect.any(Number),
        activeOffers: expect.any(Number),
        todayEnquiries: expect.any(Number),
      });
    });
  });

  describe('4. Customer Management Endpoints', () => {
    it('GET /api/v1/admin/users should return paginated list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data).toMatchObject({
        data: expect.any(Array),
        total: expect.any(Number),
        page: 1,
        limit: 20,
      });
    });

    it('GET /api/v1/admin/users/:id should return 404 for non-existent UUID', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      const res = await request(app.getHttpServer())
        .get(`/api/v1/admin/users/${fakeUuid}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(res.body.message).toContain('not found');
    });

    it('GET /api/v1/admin/users/:id should return 400 for invalid UUID format', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/users/invalid-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });

  describe('5. POST /api/v1/admin/auth/logout', () => {
    it('should successfully log out and invalidate refresh token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      expect(res.body.data.message).toBe('Successfully logged out');
    });
  });
});
