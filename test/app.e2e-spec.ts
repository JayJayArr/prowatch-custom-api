import * as request from 'supertest';

import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from './../src/app.module';
import { INestApplication } from '@nestjs/common';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect(
        'This API returns DATA from Honeywell BRNO, any use other than the intended use is not allowed'
      );
  });

  it('/POST', () => {
    const authheader =
      'Basic ' +
      btoa(process.env.HTTP_BASIC_USER + ':' + process.env.HTTP_BASIC_PASS);
    return request(app.getHttpServer())
      .post('/')
      .set('Authorization', authheader)
      .send({
        endtime: '2022-12-19 07:01:00.000',
        starttime: '2020-12-19 07:00:00.000'
      })
      .expect(201)
      .then(({ body }) => {
        expect(body).toBeDefined();
      });
  });
});
