import { RequestMethod, Type } from '@nestjs/common';
import {
  GUARDS_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants';
import { UserRole } from '@prisma/client';
import { ExerciseController } from '../exercise/exercise.controller';
import { FlashcardController } from '../flashcard/flashcard.controller';
import { LessonController } from '../lesson/lesson.controller';
import { PronunciationController } from '../pronunciation/pronunciation.controller';
import { SentenceController } from '../sentence/sentence.controller';
import { TopicController } from '../topic/topic.controller';
import { UserController } from '../user/user.controller';
import { ROLES_KEY } from './decorators/roles.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

interface Route {
  name: string;
  method: RequestMethod;
  path: string;
  guards: unknown[];
  roles: UserRole[] | undefined;
}

function routesOf(controller: Type): Route[] {
  const proto = controller.prototype as Record<string, unknown>;
  const routes: Route[] = [];
  for (const name of Object.getOwnPropertyNames(proto)) {
    const handler = proto[name];
    if (typeof handler !== 'function') continue;
    const method = Reflect.getMetadata(METHOD_METADATA, handler) as
      | RequestMethod
      | undefined;
    if (method === undefined) continue;
    routes.push({
      name,
      method,
      path: (Reflect.getMetadata(PATH_METADATA, handler) as string) ?? '',
      guards:
        (Reflect.getMetadata(GUARDS_METADATA, handler) as unknown[]) ?? [],
      roles: Reflect.getMetadata(ROLES_KEY, handler) as UserRole[] | undefined,
    });
  }
  return routes;
}

const isAdminOnly = (r: Route) =>
  r.guards.includes(JwtAuthGuard) &&
  r.guards.includes(RolesGuard) &&
  (r.roles ?? []).includes(UserRole.ADMIN);

const CONTENT_CONTROLLERS: Type[] = [
  TopicController,
  LessonController,
  FlashcardController,
  SentenceController,
  ExerciseController,
];

describe('route protection', () => {
  describe.each(CONTENT_CONTROLLERS.map((c) => [c.name, c] as const))(
    '%s',
    (_name, controller) => {
      const routes = routesOf(controller);

      it('has routes', () => {
        expect(routes.length).toBeGreaterThan(0);
      });

      it('requires ADMIN for every write route', () => {
        const unprotected = routes
          .filter((r) => r.method !== RequestMethod.GET && !isAdminOnly(r))
          .map((r) => r.name);
        expect(unprotected).toEqual([]);
      });

      it('requires ADMIN for exports', () => {
        const unprotected = routes
          .filter((r) => r.path === 'export' && !isAdminOnly(r))
          .map((r) => r.name);
        expect(unprotected).toEqual([]);
      });
    },
  );

  it('requires ADMIN for user administration routes', () => {
    const admin = routesOf(UserController).filter(
      (r) =>
        (r.method === RequestMethod.GET &&
          ['/', '', ':id', ':id/stats'].includes(r.path)) ||
        (r.method === RequestMethod.PUT && r.path === ':id/status'),
    );
    expect(admin).toHaveLength(4);
    expect(admin.filter((r) => !isAdminOnly(r)).map((r) => r.name)).toEqual([]);
  });

  it('requires login for pronunciation assessment', () => {
    const routes = routesOf(PronunciationController);
    expect(routes.length).toBeGreaterThan(0);
    for (const r of routes) expect(r.guards).toContain(JwtAuthGuard);
  });
});
