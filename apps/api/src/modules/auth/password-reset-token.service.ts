import { createHash } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

const PURPOSE = 'password-reset';
const EXPIRES_IN = '10m';

interface PasswordResetPayload {
  sub: string; // email
  purpose: typeof PURPOSE;
  ver: string; // fingerprint of the password hash at issue time
}

/**
 * Short-lived proof that the caller just verified an OTP for an email.
 * Signed with its own key (so it can never pass as an access token) and bound
 * to the current password hash (so it stops working once the password changes).
 */
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

  /** Issue a token for an existing user; undefined if there is none. */
  async issue(email: string): Promise<string | undefined> {
    const ver = await this.fingerprint(email);
    if (ver === null) return undefined;
    const payload: PasswordResetPayload = { sub: email, purpose: PURPOSE, ver };
    return this.jwt.signAsync(payload, {
      secret: this.secret(),
      expiresIn: EXPIRES_IN,
    });
  }

  /** Throws unless `token` is a valid, unused reset token for `email`. */
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
