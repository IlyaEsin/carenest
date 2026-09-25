import { expect, type APIRequestContext, type Page } from '@playwright/test';
import { mailpitUrl } from './urls';

type MailpitSearch = { messages: { ID: string }[] };
type MailpitMessage = { Text: string };

// Mailpit lists the newest message first.
async function newestMessageId(request: APIRequestContext, email: string): Promise<string | undefined> {
  const response = await request.get(`${mailpitUrl}/api/v1/search`, { params: { query: `to:"${email}"` } });
  const search = (await response.json()) as MailpitSearch;
  return search.messages[0]?.ID;
}

export async function latestMagicLink(request: APIRequestContext, email: string): Promise<string> {
  let id: string | undefined;
  await expect.poll(async () => (id = await newestMessageId(request, email)), { message: `no email for ${email}` }).toBeTruthy();

  const message = (await (await request.get(`${mailpitUrl}/api/v1/message/${id}`)).json()) as MailpitMessage;
  const link = /(https?:\/\/\S+\/auth\/email\?\S+)/.exec(message.Text)?.[1];
  expect(link, 'magic link in the email body').toBeTruthy();
  return link!;
}

// Signs in through the real UI and the real inbox; the link is opened in the same browser, as the nonce cookie requires.
export async function signInWithEmail(page: Page, appUrl: string, email: string, next = '/'): Promise<void> {
  await page.goto(`${appUrl}/sign-in?next=${encodeURIComponent(next)}`);
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: 'Email me a sign-in link' }).click();
  await expect(page.getByText('Check your email')).toBeVisible();

  await page.goto(await latestMagicLink(page.request, email));
}
