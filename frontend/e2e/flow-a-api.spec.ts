import { test, expect } from '@playwright/test';

const API = process.env.PLAYWRIGHT_API_URL ?? 'http://127.0.0.1:3001';

test.describe('Fluxo A (API) — registro, onboarding, sessão diária', () => {
  test('backend health', async ({ request }) => {
    const res = await request.get(`${API}/health`);
    expect(res.ok(), await res.text()).toBeTruthy();
  });

  test('cadastro → onboarding → GET session/daily', async ({ request }) => {
    const health = await request.get(`${API}/health`);
    test.skip(!health.ok(), 'Backend não está acessível em ' + API);

    const email = `e2e_${Date.now()}@test.local`;
    const reg = await request.post(`${API}/api/auth/register`, {
      data: { email, password: 'senhaSegura12', name: 'E2E User' },
    });
    expect(reg.ok(), await reg.text()).toBeTruthy();
    const { accessToken } = (await reg.json()) as { accessToken: string };

    const onboard = await request.post(`${API}/api/onboarding`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        painPoint: 'anxiety',
        goal: 'clarity',
        emotionalState: 'hopeful',
        timeAvailable: 15,
      },
    });
    expect(onboard.ok(), await onboard.text()).toBeTruthy();

    const daily = await request.get(`${API}/api/session/daily`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(daily.ok(), await daily.text()).toBeTruthy();
    const body = (await daily.json()) as { session: { id: string; content: unknown }; correlationId?: string };
    expect(body.session?.id).toBeTruthy();
    expect(body.session?.content).toBeTruthy();
  });
});
