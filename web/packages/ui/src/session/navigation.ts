import { apiUrl, getStartExternalSignInUrl } from '@carenest/api-client';

export type SignInMode = 'signin' | 'link';

// "next" comes from the address bar, so only same-app paths are followed; anything else lands on home.
export function safeNext(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return '/';
  }

  return value;
}

export function emailCallbackUrl(next: string, origin: string = window.location.origin): string {
  return `${origin}/auth/email?next=${encodeURIComponent(safeNext(next))}`;
}

export function externalReturnUrl(next: string, origin: string = window.location.origin): string {
  return `${origin}/auth/external?next=${encodeURIComponent(safeNext(next))}`;
}

type ExternalSignIn = {
  provider: string;
  next: string;
  mode: SignInMode;
  language: string;
  timeZone: string;
};

// OAuth needs a full-page navigation to the API, not a fetch, so this builds the URL the browser goes to.
export function externalSignInUrl({ provider, next, mode, language, timeZone }: ExternalSignIn): string {
  return apiUrl(getStartExternalSignInUrl(provider, { returnUrl: externalReturnUrl(next), mode, language, timeZone }));
}
