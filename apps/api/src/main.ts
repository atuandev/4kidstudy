import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { API_PREFIX, createSwaggerConfig } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // Exact origins only: credentials are allowed, so no wildcards.
  // The Vercel project was renamed 4kidstudy-frontend -> 4kidstudy; the old
  // aliases stay until nothing serves them. Extra origins: CORS_ORIGINS
  // (comma-separated).
  const extraOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: [
      'http://localhost:3000',
      // Production
      'https://4kidstudy-frontend.vercel.app',
      'https://4kidstudy-atuandev-projects.vercel.app',
      'https://4kidstudy-git-master-atuandev-projects.vercel.app',
      // Branch previews
      'https://4kidstudy-git-dev-atuandev-projects.vercel.app',
      'https://4kidstudy-git-dev2-atuandev-projects.vercel.app',
      'https://4kidstudy-frontend-git-dev-atuandev-projects.vercel.app',
      'https://4kidstudy-frontend-git-dev2-atuandev-projects.vercel.app',
      ...extraOrigins,
    ],
    credentials: true,
  });

  // Swagger Configuration
  const config = createSwaggerConfig();
  const document = SwaggerModule.createDocument(app as any, config);
  SwaggerModule.setup('api/docs', app as any, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3001);
  const port = process.env.PORT ?? 3001;
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(
    `Swagger documentation available at: http://localhost:${port}/api/docs`,
  );
}
bootstrap();
