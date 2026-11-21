import { createHash } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

const PURPOSE = 'password-reset';
const EXPIRES_IN = '10m';

interface PasswordResetPayload {
  sub: string;
  purpose: typeof PURPOSE;
  ver: string;
}

@Injectable()
export class PasswordResetTokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private secret(): string {
    return `${this.config.getOrThrow<string>('ACCESS_TOKEN_SECRET')}:${PURPOSE}`;
  }

  private async fingerprint(email: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { passwordHash: true },
    });
    if (!user) return null;
    return createHash('sha256')
      .update(user.passwordHash ?? '')
      .digest('hex')
      .slice(0, 16);
  }

  async issue(email: string): Promise<string | undefined> {
    const ver = await this.fingerprint(email);
    if (ver === null) return undefined;
    const payload: PasswordResetPayload = { sub: email, purpose: PURPOSE, ver };
    return this.jwt.signAsync(payload, {
      secret: this.secret(),
      expiresIn: EXPIRES_IN,
    });
  }

  async verify(token: string, email: string): Promise<void> {
    const invalid = new UnauthorizedException(
      'Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
    );
    let payload: PasswordResetPayload;
    try {
      payload = await this.jwt.verifyAsync<PasswordResetPayload>(token, {
        secret: this.secret(),
      });
    } catch {
      throw invalid;
    }
    if (payload.purpose !== PURPOSE || payload.sub !== email) throw invalid;
    if (payload.ver !== (await this.fingerprint(email))) throw invalid;
  }
}
