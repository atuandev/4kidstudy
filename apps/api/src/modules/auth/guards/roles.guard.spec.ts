import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { RolesGuard } from './roles.guard';

function contextFor(user: unknown, roles: UserRole[] | undefined) {
  const reflector = new Reflector();
  jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(roles);
  const context = {
    getHandler: () => () => undefined,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
  return { guard: new RolesGuard(reflector), context };
}

describe('RolesGuard', () => {
  it('allows routes without @Roles()', () => {
    const { guard, context } = contextFor(undefined, undefined);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows a user with a required role', () => {
    const { guard, context } = contextFor({ role: UserRole.ADMIN }, [
      UserRole.ADMIN,
    ]);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies a user without a required role', () => {
    const { guard, context } = contextFor({ role: UserRole.LEARNER }, [
      UserRole.ADMIN,
    ]);
    expect(guard.canActivate(context)).toBe(false);
  });

  it('denies a request with no user', () => {
    const { guard, context } = contextFor(undefined, [UserRole.ADMIN]);
    expect(guard.canActivate(context)).toBe(false);
  });
});
