import { chromium, expect, request, type FullConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
import { signInWithEmail } from './mail';
import { adminEmail, adminStatePath, studioUrl } from './urls';

// The API can come up a little after the Vite servers Playwright waits for.
async function waitForApi(): Promise<void> {
  const api = await request.newContext();
  await expect
    .poll(async () => (await api.get(`${studioUrl}/api/identity/providers`).catch(() => null))?.status(), { timeout: 120_000 })
    .toBe(200);
  await api.dispose();
}

async function adminStateIsValid(): Promise<boolean> {
  if (!existsSync(adminStatePath)) {
    return false;
  }

  const api = await request.newContext({ storageState: adminStatePath });
  const me = await api.get(`${studioUrl}/api/identity/me`);
  const valid = me.ok() && ((await me.json()) as { roles: string[] }).roles.includes('admin');
  await api.dispose();
  return valid;
}

// The admin session is cached between runs because the API sends at most three links per address in ten minutes.
export default async function globalSetup(_config: FullConfig): Promise<void> {
  await waitForApi();
  if (await adminStateIsValid()) {
    return;
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({ locale: 'en-US' });
  const page = await context.newPage();
  await signInWithEmail(page, studioUrl, adminEmail);
  await expect(page.getByRole('link', { name: 'Consultants' })).toBeVisible();
  await context.storageState({ path: adminStatePath });
  await browser.close();
}
