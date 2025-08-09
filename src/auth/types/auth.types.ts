export interface JwtPayload {
  sub: number;
  email: string;
  role: 'USER' | 'ADMIN';
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role: 'USER' | 'ADMIN';
    name?: string;
  };
}

export type UserRole = 'USER' | 'ADMIN';

export interface TokenConfig {
  secret: string;
  expiresIn: string;
}
