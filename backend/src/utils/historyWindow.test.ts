import { describe, it, expect } from 'vitest';
import { minHistoryDayForFreeTier } from './historyWindow';

describe('minHistoryDayForFreeTier', () => {
  it('mantém janela de 7 dias de jornada', () => {
    expect(minHistoryDayForFreeTier(10)).toBe(4);
    expect(minHistoryDayForFreeTier(7)).toBe(1);
    expect(minHistoryDayForFreeTier(3)).toBe(1);
  });
});
