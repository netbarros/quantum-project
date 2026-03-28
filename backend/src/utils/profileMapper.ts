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

export type ProfileType = 'REACTIVE' | 'LOST' | 'INCONSISTENT' | 'SEEKING' | 'STRUCTURED';

export interface ProfileInput {
  painPoint: PainPoint;
  goal: Goal;
  emotionalState: EmotionalState;
  timeAvailable: number;
}

/**
 * Maps onboarding answers to a ProfileType.
 * Priority order: REACTIVE → LOST → INCONSISTENT → SEEKING → STRUCTURED → default SEEKING
 */
export function mapProfile(input: ProfileInput): ProfileType {
  const { painPoint, goal, emotionalState, timeAvailable } = input;

  if (emotionalState === 'anxious' && painPoint === 'emotional_instability') {
    return 'REACTIVE';
  }

  if (emotionalState === 'lost' && painPoint === 'lack_of_purpose') {
    return 'LOST';
  }

  if (timeAvailable <= 5 && painPoint === 'lack_of_discipline') {
    return 'INCONSISTENT';
  }

  if (emotionalState === 'hopeful' || goal === 'spiritual_growth') {
    return 'SEEKING';
  }

  if (timeAvailable >= 20 && emotionalState === 'motivated') {
    return 'STRUCTURED';
  }

  return 'SEEKING';
}
