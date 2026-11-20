import { UserRole } from '@prisma/client';

export interface JwtUser {
  id: number;
  email: string;
  role: UserRole;
}

// Extend Express User type
import 'passport';

// Global augmentation needs a namespace and an interface (a type alias can't merge).
declare global {
  // oxlint-disable-next-line typescript/no-namespace
  namespace Express {
    // Augment the existing User interface from passport types
    // oxlint-disable-next-line typescript/no-empty-object-type
    interface User extends JwtUser {}
  }
}
