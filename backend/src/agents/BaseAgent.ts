import { AgentMessage } from '../types/agent.types';
import { AgentRegistry } from './AgentRegistry';

export abstract class BaseAgent {
  abstract readonly name: string;
  abstract readonly description: string;

  abstract execute(message: AgentMessage): Promise<AgentMessage>;

  async communicate(
    targetAgent: string,
    message: Omit<AgentMessage, 'sourceAgent' | 'timestamp'>
  ): Promise<AgentMessage> {
    const fullMessage: AgentMessage = {
      ...message,
      sourceAgent: this.name,
      targetAgent,
      timestamp: new Date(),
    };
    return AgentRegistry.getInstance().dispatch(fullMessage);
  }

  protected createResponse(
    originalMessage: AgentMessage,
    payload: Record<string, any>
  ): AgentMessage {
    return {
      type: `${originalMessage.type}_response`,
      payload,
      userId: originalMessage.userId,
      timestamp: new Date(),
      sourceAgent: this.name,
      targetAgent: originalMessage.sourceAgent,
    };
  }
}
