export interface AgentMessage {
  type: string;
  payload: Record<string, any>;
  userId: string;
  timestamp: Date;
  sourceAgent: string;
  targetAgent?: string;
}

export type AgentType = 
  | 'ContentAgent'
  | 'PersonalizationAgent'
  | 'ProgressAgent'
  | 'NotificationAgent'
  | 'MonetizationAgent';
