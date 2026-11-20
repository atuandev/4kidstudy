import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordResetTokenService } from './password-reset-token.service';

const SECRET = 'test-access-secret';

describe('PasswordResetTokenService', () => {
  let passwordHash: string | null;
  let userExists: boolean;
  let service: PasswordResetTokenService;
  const jwt = new JwtService({});

  beforeEach(() => {
    passwordHash = 'hash-1';
    userExists = true;
    const prisma = {
      user: {
        findUnique: jest.fn(() =>
          Promise.resolve(userExists ? { passwordHash } : null),
        ),
      },
    } as unknown as PrismaService;
    const config = {
      getOrThrow: () => SECRET,
    } as unknown as ConfigService;
    service = new PasswordResetTokenService(jwt, config, prisma);
  });

  it('accepts its own token for the same email', async () => {
    const token = await service.issue('a@example.com');
    expect(token).toBeDefined();
    await expect(
      service.verify(token!, 'a@example.com'),
    ).resolves.toBeUndefined();
  });

  it('issues nothing for an unknown email', async () => {
    userExists = false;
    await expect(service.issue('nobody@example.com')).resolves.toBeUndefined();
  });

  it('rejects a token for a different email', async () => {
    const token = await service.issue('a@example.com');
    await expect(service.verify(token!, 'b@example.com')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects a token once the password has changed', async () => {
    const token = await service.issue('a@example.com');
    passwordHash = 'hash-2';
    await expect(service.verify(token!, 'a@example.com')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects an access token signed with the access secret', async () => {
    const accessToken = await jwt.signAsync(
      { sub: 'a@example.com', purpose: 'password-reset' },
      { secret: SECRET },
    );
    await expect(service.verify(accessToken, 'a@example.com')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects garbage', async () => {
    await expect(service.verify('not-a-jwt', 'a@example.com')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
