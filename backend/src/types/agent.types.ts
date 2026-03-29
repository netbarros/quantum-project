export interface AgentMessage {
  type: string;
  payload: Record<string, unknown>;
  userId: string;
  timestamp: Date;
  sourceAgent: string;
  targetAgent?: string;
  /** Request tracing (header x-correlation-id ou UUID gerado no controller) */
  correlationId?: string;
}

export type AgentType = 
  | 'ContentAgent'
  | 'PersonalizationAgent'
  | 'ProgressAgent'
  | 'NotificationAgent'
  | 'MonetizationAgent';
