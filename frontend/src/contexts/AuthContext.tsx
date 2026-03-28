"use client";

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { User, LoginRequest, RegisterRequest } from '../types';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  exp?: number;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  /** Update user in both React state and localStorage. Use after onboarding,
   *  profile edits, or any server response that returns fresh user data. */
  updateUser: (partial: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** Canonical user-update helper — always call this instead of setUser directly. */
  const updateUser = useCallback((partial: Partial<User>) => {
    setUser((prev) => {
      const next = prev ? { ...prev, ...partial } : (partial as User);
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            throw new Error('Token expired');
          }
          setAccessToken(token);
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            setUser(JSON.parse(savedUser) as User);
          } else {
            updateUser({ id: decoded.userId, email: decoded.email, role: decoded.role } as Partial<User>);
          }
        } catch {
          const refreshTk = localStorage.getItem('refreshToken');
          if (refreshTk) {
            try {
              const res = await fetch(`${BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: refreshTk }),
              });
              if (res.ok) {
                const { accessToken: newTk, refreshToken: newRefreshTk, user: freshUser } = await res.json();
                localStorage.setItem('accessToken', newTk);
                localStorage.setItem('refreshToken', newRefreshTk);
                setAccessToken(newTk);
                if (freshUser) {
                  // Server returned fresh user data — use it as source of truth.
                  updateUser(freshUser as Partial<User>);
                } else {
                  const savedUser = localStorage.getItem('user');
                  if (savedUser) {
                    setUser(JSON.parse(savedUser) as User);
                  } else {
                    const decoded = jwtDecode<JwtPayload>(newTk);
                    updateUser({ id: decoded.userId, email: decoded.email, role: decoded.role } as Partial<User>);
                  }
                }
                setIsLoading(false);
                return;
              }
            } catch {
              // Fallthrough to logout
            }
          }
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [updateUser]);

  const login = async (data: LoginRequest) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Login failed');
    }

    const result = await response.json();
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    setAccessToken(result.accessToken);
    updateUser(result.user);
    return result.user;
  };

  const register = async (data: RegisterRequest) => {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Registration failed');
    }

    const result = await response.json();
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    setAccessToken(result.accessToken);
    updateUser(result.user);
    return result.user;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setAccessToken(null);
    setUser(null);
  };

  const refreshTokens = async () => {
    const refreshTk = localStorage.getItem('refreshToken');
    if (!refreshTk) throw new Error('No refresh token');

    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refreshTk }),
    });

    if (res.ok) {
      const { accessToken: newTk, refreshToken: newRefreshTk, user: freshUser } = await res.json();
      localStorage.setItem('accessToken', newTk);
      localStorage.setItem('refreshToken', newRefreshTk);
      setAccessToken(newTk);
      if (freshUser) {
        updateUser(freshUser);
      }
    } else {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshToken: refreshTokens,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
