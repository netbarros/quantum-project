"use client";

import { useContext } from 'react';
import { AuthContext, AuthContextType } from '../contexts/AuthContext';

// Re-export so callers can type updateUser and other members from a single import.
export type { AuthContextType };

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
