import { ConfigService } from '@nestjs/config';
import { JwtStrategy, USER_EXISTS_TTL_MS } from './jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';

describe('JwtStrategy.validate', () => {
  const prisma = { user: { findUnique: jest.fn() } };
  const config = {
    getOrThrow: () => 'test-secret',
  } as unknown as ConfigService;
  const payload = { sub: 7, email: 'kid@example.com', role: 'LEARNER' };
  let strategy: JwtStrategy;
  let now: number;

  beforeEach(() => {
    jest.clearAllMocks();
    now = 1_000_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    strategy = new JwtStrategy(prisma as unknown as PrismaService, config);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('looks the user up once and reuses it within the TTL', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 7 });

    const first = await strategy.validate(payload);
    now += USER_EXISTS_TTL_MS - 1;
    const second = await strategy.validate(payload);

    const expected = { id: 7, email: 'kid@example.com', role: 'LEARNER' };
    expect(first).toEqual(expected);
    expect(second).toEqual(expected);
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
  });

  it('asks the database again once the TTL has passed', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({ id: 7 })
      .mockResolvedValueOnce(null);

    await strategy.validate(payload);
    now += USER_EXISTS_TTL_MS;
    const result = await strategy.validate(payload);

    expect(result).toBeNull();
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(2);
  });

  it('does not cache a missing user', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 7 });

    expect(await strategy.validate(payload)).toBeNull();
    expect(await strategy.validate(payload)).not.toBeNull();
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(2);
  });
});
