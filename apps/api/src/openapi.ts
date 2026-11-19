/**
 * Prints the OpenAPI document to stdout without starting the server.
 *
 * `preview: true` builds the module graph without instantiating providers,
 * so no database, mail, or third-party connections are opened. Run after
 * `nest build` (the Swagger CLI plugin annotates DTOs at compile time):
 *
 *   node dist/openapi.js > openapi.json
 */
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
