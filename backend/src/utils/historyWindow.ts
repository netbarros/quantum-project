/**
 * PR-00 (histórico free): últimos 7 “dias de jornada” (incluindo o dia atual).
 * Retorna o menor `day` incluído no recorte (ex.: currentDay=10 → 4).
 */
export function minHistoryDayForFreeTier(currentDay: number): number {
  return Math.max(1, currentDay - 6);
}
