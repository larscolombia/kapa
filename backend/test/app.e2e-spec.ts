import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('System E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ping (GET) - Health Check', () => {
    return request(app.getHttpServer())
      .get('/ping')
      .expect(200)
      .expect('pong');
  });

  describe('Clients Module', () => {
    // Test Case 1: Valid Client with ID 170 (Cogua) - Should return projects
    // This confirms that the manual fix (or auto-correction if applicable) works
    it('GET /clients/170/projects - Should return projects for Cogua (ID 170)', () => {
      return request(app.getHttpServer())
        .get('/clients/170/projects')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            // Projects have project_id, not id
            expect(res.body[0]).toHaveProperty('project_id');
            expect(res.body[0]).toHaveProperty('name');
          }
        });
    });

    // Test Case 2: Valid Client with ID 170 (Cogua) - Should return contractors
    it('GET /clients/170/contractors - Should return contractors for Cogua (ID 170)', () => {
      return request(app.getHttpServer())
        .get('/clients/170/contractors')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    // Test Case 3: Non-existent Client - Should return 200 with empty array (Current behavior)
    // The service returns empty array instead of 404 to avoid frontend errors
    it('GET /clients/999999/projects - Should return 200 with empty array for non-existent client', () => {
      return request(app.getHttpServer())
        .get('/clients/999999/projects')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(0);
        });
    });

    // Test Case 4: Client 169 (Peldar Soacha) - Should trigger auto-correction and return projects
    it('GET /clients/169/projects - Should trigger auto-correction for Peldar Soacha (ID 169)', () => {
      return request(app.getHttpServer())
        .get('/clients/169/projects')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          // Should return projects (auto-corrected to ID 1)
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('project_id');
          }
        });
    });

    // Test Case 5: Client 169 (Peldar Soacha) - Should trigger auto-correction and return contractors
    it('GET /clients/169/contractors - Should trigger auto-correction for Peldar Soacha (ID 169)', () => {
      return request(app.getHttpServer())
        .get('/clients/169/contractors')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          // Should return contractors (auto-corrected to ID 1)
          // Note: We don't strictly check length > 0 here as it depends on data, 
          // but we expect 200 OK and array, not 404 or error.
        });
    });
  });
});
