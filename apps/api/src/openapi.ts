import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { API_PREFIX, createSwaggerConfig } from './swagger';

async function main() {
  const app = await NestFactory.create(AppModule, {
    preview: true,
    logger: false,
  });
  app.setGlobalPrefix(API_PREFIX);
  const document = SwaggerModule.createDocument(app, createSwaggerConfig());
  process.stdout.write(JSON.stringify(document));
  await app.close();
}

void main();
