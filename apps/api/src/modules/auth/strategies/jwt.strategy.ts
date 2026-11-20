import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

/** How long a confirmed user id is trusted before the database is asked again. */
export const USER_EXISTS_TTL_MS = 60_000;

/** Upper bound on cached ids, so memory stays small however many users sign in. */
const USER_EXISTS_MAX_ENTRIES = 10_000;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  /**
   * User id -> time (ms) until which the user is known to exist. Every
   * authenticated request ran this lookup before its handler, so caching it
   * removes one database round-trip from most requests. Only hits are
   * cached; a deleted user's token keeps working for at most the TTL.
   * The cache is per process, so each server instance warms its own.
   */
  private readonly userExistsUntil = new Map<number, number>();

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // No fallback: a missing secret must stop the app, not use a public key.
      secretOrKey: configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: any) {
    const userId = payload.sub as number;

    if (!(await this.userExists(userId))) {
      return null;
    }

    // Return a user object to be assigned to the request
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }

  private async userExists(userId: number): Promise<boolean> {
    const now = Date.now();
    const cachedUntil = this.userExistsUntil.get(userId);
    if (cachedUntil !== undefined && cachedUntil > now) {
      return true;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      this.userExistsUntil.delete(userId);
      return false;
    }

    if (this.userExistsUntil.size >= USER_EXISTS_MAX_ENTRIES) {
      this.userExistsUntil.clear();
    }
    this.userExistsUntil.set(userId, now + USER_EXISTS_TTL_MS);
    return true;
  }
}
