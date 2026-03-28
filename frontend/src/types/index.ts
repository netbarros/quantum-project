export interface User {
  id: string;
  email: string;
  name?: string | null;
  role?: string;
  onboardingComplete?: boolean;
  isPremium?: boolean;
  /** Prisma Level enum string */
  level?: string;
  profileType?: string | null;
  consciousnessScore?: number;
  streak?: number;
  painPoint?: string | null;
  goal?: string | null;
  emotionalState?: string | null;
  timeAvailable?: number | null;
  language?: string;
  notificationTime?: string | null;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  language?: string;
}

// Onboarding input types
export type PainPoint =
  | 'anxiety'
  | 'lack_of_purpose'
  | 'emotional_instability'
  | 'spiritual_disconnection'
  | 'lack_of_discipline'
  | 'identity_crisis';

export type Goal =
  | 'inner_peace'
  | 'clarity'
  | 'emotional_mastery'
  | 'spiritual_growth'
  | 'discipline'
  | 'self_knowledge';

export type EmotionalState =
  | 'anxious'
  | 'lost'
  | 'frustrated'
  | 'hopeful'
  | 'neutral'
  | 'motivated';

export interface OnboardingInput {
  painPoint: PainPoint;
  goal: Goal;
  emotionalState: EmotionalState;
  timeAvailable: number;
}
