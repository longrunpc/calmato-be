import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  const corsOriginEnv = process.env.CORS_ORIGIN;
  const isAllowAll = corsOriginEnv === '*';
  app.enableCors({
    origin: isAllowAll
      ? true
      : corsOriginEnv?.split(',') || ['http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // 글로벌 Validation 파이프 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Calmato API')
    .setDescription('Calmato 백엔드 API 문서')
    .setVersion('1.0')
    .addTag('인증', '사용자 인증 및 권한 관리')
    .addTag('기본', '기본 API 엔드포인트')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'JWT 토큰을 입력하세요',
      in: 'header',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `애플리케이션이 포트 ${process.env.PORT ?? 3000}에서 실행 중입니다.`,
  );
  console.log(`API 문서: http://localhost:${process.env.PORT ?? 3000}/api`);
}

void bootstrap();
