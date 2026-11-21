import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

export const USER_EXISTS_TTL_MS = 60_000;

const USER_EXISTS_MAX_ENTRIES = 10_000;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly userExistsUntil = new Map<number, number>();

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: any) {
    const userId = payload.sub as number;

    if (!(await this.userExists(userId))) {
      return null;
    }

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
