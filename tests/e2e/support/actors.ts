import { devices, expect, type Browser, type Page } from '@playwright/test';
import { signInWithEmail } from './mail';
import { adminStatePath, clientUrl, studioUrl, uniqueEmail } from './urls';

// Parents use phones, so parent pages run in a mobile viewport.
export async function newParentPage(browser: Browser, timezoneId = 'Europe/Moscow'): Promise<Page> {
  const context = await browser.newContext({ ...devices['Pixel 7'], locale: 'en-US', timezoneId });
  return context.newPage();
}

export async function signedInParent(browser: Browser, timezoneId?: string): Promise<{ page: Page; email: string }> {
  const page = await newParentPage(browser, timezoneId);
  const email = uniqueEmail('parent');
  await signInWithEmail(page, clientUrl, email);
  await expect(page.getByRole('heading', { name: /Hello, parent-/ })).toBeVisible();
  return { page, email };
}

// The admin creates the consultant through the studio form, then the consultant signs in in a browser of their own.
export async function signedInConsultant(browser: Browser, name: string, timeZone: string): Promise<Page> {
  const email = uniqueEmail('consultant');
  const admin = await (await browser.newContext({ storageState: adminStatePath, locale: 'en-US' })).newPage();
  await admin.goto(`${studioUrl}/admin/consultants`);
  await admin.getByLabel('Consultant email').fill(email);
  await admin.getByLabel('Consultant name').fill(name);
  await admin.getByLabel('Consultant time zone').fill(timeZone);
  await admin.getByRole('button', { name: 'Create consultant' }).click();
  await expect(admin.getByText('Consultant created')).toBeVisible();
  await admin.context().close();

  const page = await (await browser.newContext({ locale: 'en-US', timezoneId: timeZone })).newPage();
  await signInWithEmail(page, studioUrl, email);
  await expect(page.getByRole('heading', { name: 'Consultant workspace' })).toBeVisible();
  return page;
}

export async function createInvitation(consultant: Page): Promise<string> {
  await consultant.getByRole('button', { name: 'Create invitation' }).click();
  const link = consultant.getByRole('textbox', { name: 'Invitation link is ready' });
  await expect(link).toHaveValue(/\/invite\//);
  return link.inputValue();
}
