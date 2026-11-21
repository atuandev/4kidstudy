import { UserRole } from '@prisma/client';

export interface JwtUser {
  id: number;
  email: string;
  role: UserRole;
}

import 'passport';

declare global {
  namespace Express {
    interface User extends JwtUser {}
  }
}
