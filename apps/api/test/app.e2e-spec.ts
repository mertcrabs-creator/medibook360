import { Test, TestingModule } from '@nestjs/testing';
import { NestNodeApplication, NodeAdapter } from '@nestjs/platform-node';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';

describe('Health (e2e)', () => {
  let app: NestNodeApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestNodeApplication>(new NodeAdapter());
    app.useSecurityHeaders();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health/live returns ok', () => {
    return request(app.getHttpServer())
      .get('/api/health/live')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('sends security headers', async () => {
    const res = await request(app.getHttpServer()).get('/api/health/live');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('GET /api/health/ready reports the database as up', () => {
    return request(app.getHttpServer())
      .get('/api/health/ready')
      .expect(200)
      .expect((res) => expect(res.body.info.database.status).toBe('up'));
  });
});
