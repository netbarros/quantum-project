export interface ContentInput {
  userId: string;
  day: number;
  language: string;
  painPoint: string;
  goal: string;
  emotionalState: string;
  consciousnessScore: number;
  streak: number;
  timeAvailable: number;
}

export interface ContentOutput {
  direction: string;
  explanation: string;
  reflection: string;
  action: string;
  question: string;
  affirmation: string;
  practice: string;
  integration: string;
}

export interface AIResponse {
  content: ContentOutput | null;
  error?: string;
  isFallback: boolean;
}
