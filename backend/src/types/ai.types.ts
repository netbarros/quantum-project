export interface ContentAdjustments {
  depthLevel: 'surface' | 'moderate' | 'deep' | 'profound';
  tone: 'gentle' | 'direct' | 'challenging' | 'provocative';
  contentLength: 'brief' | 'standard' | 'extended';
  focusArea: string;
}

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
  adjustments?: ContentAdjustments;
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
  modelUsed?: string;
}
