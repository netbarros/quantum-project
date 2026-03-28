import { Request } from 'express';

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  language?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name?: string | null;
  role?: string;
  onboardingComplete?: boolean;
  isPremium?: boolean;
  level?: string;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}
