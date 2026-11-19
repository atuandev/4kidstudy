import { DocumentBuilder } from '@nestjs/swagger';

/** Global route prefix. Shared by main.ts and the OpenAPI generator. */
export const API_PREFIX = 'api';

export function createSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('4KidStudy API')
    .setDescription('API documentation for 4KidStudy learning platform')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('topics', 'Topic management endpoints')
    .addTag('flashcards', 'Flashcard management endpoints')
    .addTag('lessons', 'Lesson management endpoints')
    .addTag('exercises', 'Exercise management endpoints')
    .addTag('users', 'User management endpoints')
    .addBearerAuth()
    .build();
}
