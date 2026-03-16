import * as jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export class JWTService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
  private static readonly ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '2h';
  private static readonly REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    // @ts-ignore - TypeScript overload issue with jwt.sign
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.ACCESS_TOKEN_EXPIRY });
  }

  static generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    // @ts-ignore - TypeScript overload issue with jwt.sign
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.REFRESH_TOKEN_EXPIRY });
  }

  static verifyAccessToken(token: string): JWTPayload {
    return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
  }

  static verifyRefreshToken(token: string): JWTPayload {
    return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
  }

  static generateTokenResponse(user: { id: string; email: string; role: UserRole }): TokenResponse {
    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
      user,
    };
  }

  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }
} 