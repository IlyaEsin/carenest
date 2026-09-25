import { expect, test } from '@playwright/test';
import { createInvitation, newParentPage, signedInConsultant, signedInParent } from '../support/actors';
import { latestMagicLink } from '../support/mail';
import { uniqueEmail } from '../support/urls';

test('a consultant invites a new parent who accepts and becomes a client', async ({ browser }) => {
  const consultant = await signedInConsultant(browser, 'Consultant Moscow', 'Europe/Moscow');
  const invitation = await createInvitation(consultant);
  await expect(consultant.getByText(/Valid for 14 days/)).toBeVisible();

  // A brand-new parent in Vladivostok opens the link, signs up by email and lands back on the invitation.
  const parent = await newParentPage(browser, 'Asia/Vladivostok');
  await parent.goto(invitation);
  await expect(parent.getByText('Sign in or sign up to accept the invitation.')).toBeVisible();
  const email = uniqueEmail('parent');
  await parent.getByLabel('Email').fill(email);
  await parent.getByRole('button', { name: 'Email me a sign-in link' }).click();
  await parent.goto(await latestMagicLink(parent.request, email));
  await parent.getByRole('button', { name: 'Accept invitation' }).click();
  await expect(parent.getByText('Invitation accepted')).toBeVisible();

  // Each side sees the other's local time.
  await parent.getByRole('link', { name: 'Go to home' }).click();
  await expect(parent.getByText('Consultant Moscow')).toBeVisible();
  await expect(parent.getByText(/Consultant's local time: .* \(Europe\/Moscow\)/)).toBeVisible();

  await consultant.reload();
  await expect(consultant.getByText(/Client's local time: .* \(Asia\/Vladivostok\)/)).toBeVisible();
  await expect(consultant.getByText('Interface language: English')).toBeVisible();
  await expect(consultant.getByText('Accepted')).toBeVisible();
});

test('a used invitation shows a translated error', async ({ browser }) => {
  const consultant = await signedInConsultant(browser, 'Consultant Two', 'Europe/Moscow');
  const invitation = await createInvitation(consultant);
  const first = await signedInParent(browser);
  await first.page.goto(invitation);
  await first.page.getByRole('button', { name: 'Accept invitation' }).click();
  await expect(first.page.getByText('Invitation accepted')).toBeVisible();

  const second = await signedInParent(browser);
  await second.page.goto(invitation);
  await second.page.getByRole('button', { name: 'Accept invitation' }).click();

  await expect(second.page.getByRole('alert')).toHaveText('This invitation has already been used');
});
