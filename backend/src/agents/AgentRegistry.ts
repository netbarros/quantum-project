import { BaseAgent } from './BaseAgent';
import { AgentMessage } from '../types/agent.types';

export class AgentRegistry {
  private static instance: AgentRegistry;
  private agents: Map<string, BaseAgent> = new Map();

  static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  register(agent: BaseAgent): void {
    this.agents.set(agent.name, agent);
  }

  async dispatch(message: AgentMessage): Promise<AgentMessage> {
    const target = message.targetAgent;
    if (!target || !this.agents.has(target)) {
      throw new Error(`Agent "${target}" not found in registry`);
    }
    const agent = this.agents.get(target)!;
    return agent.execute(message);
  }

  getAgent(name: string): BaseAgent | undefined {
    return this.agents.get(name);
  }
}
