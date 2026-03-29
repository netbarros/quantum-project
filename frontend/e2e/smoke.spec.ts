import { test, expect } from '@playwright/test';

test('login mostra headline de boas-vindas', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Bem-vindo de volta' })).toBeVisible();
});
