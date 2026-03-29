import { BaseAgent } from './BaseAgent';
import { AgentMessage } from '../types/agent.types';
import { AIGateway } from '../services/AIGateway';
import { ContentInput } from '../types/ai.types';

export class ContentAgent extends BaseAgent {
  readonly name = 'ContentAgent';
  readonly description = 'Generates AI fallback or primary quantum content via OpenRouter for the daily session';

  async execute(message: AgentMessage): Promise<AgentMessage> {
    if (message.type !== 'generate_content') {
      throw new Error(`[ContentAgent] Unsupported message type: ${message.type}`);
    }

    const inputData = message.payload as unknown as ContentInput;

    // Call the AI Gateway to generate the content (handles retry and fallback internally)
    const response = await AIGateway.generateContent(inputData);

    return this.createResponse(message, {
      contentJSON: response.content,
      isStatic: response.isFallback,
    });
  }
}
