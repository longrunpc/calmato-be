import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { S3Service } from '../src/common/services/s3.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    // 테스트용 환경변수 설정
    process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
    process.env.AWS_S3_BUCKET_NAME = 'test-bucket';
    process.env.AWS_REGION = 'ap-northeast-2';

    const mockS3Service = {
      uploadFile: jest.fn().mockResolvedValue({
        key: 'test/file.jpg',
        url: 'https://test-bucket.s3.ap-northeast-2.amazonaws.com/test/file.jpg',
      }),
      deleteFile: jest.fn().mockResolvedValue(undefined),
      getFileExists: jest.fn().mockResolvedValue(true),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(S3Service)
      .useValue(mockS3Service)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});
