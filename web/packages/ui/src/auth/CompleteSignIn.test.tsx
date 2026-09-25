import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, testApi } from '../testing/render';
import { server } from '../testing/server';
import { CompleteEmailSignIn, CompleteExternalSignIn } from './CompleteSignIn';

describe('CompleteEmailSignIn', () => {
  it('posts the token exactly once and continues to the next path', async () => {
    const posted = vi.fn();
    server.use(
      http.post(`${testApi}/api/identity/email/complete`, async ({ request }) => {
        posted(await request.json());
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const onSignedIn = vi.fn();

    renderWithProviders(
      <StrictMode>
        <CompleteEmailSignIn token="t0k3n" next="/invite/abc" onSignedIn={onSignedIn} />
      </StrictMode>,
    );

    await waitFor(() => expect(onSignedIn).toHaveBeenCalledWith('/invite/abc'));
    expect(posted).toHaveBeenCalledTimes(1);
    expect(posted).toHaveBeenCalledWith({ token: 't0k3n' });
  });

  it('never continues to a foreign next path', async () => {
    server.use(http.post(`${testApi}/api/identity/email/complete`, () => new HttpResponse(null, { status: 204 })));
    const onSignedIn = vi.fn();

    renderWithProviders(<CompleteEmailSignIn token="t" next="https://evil.example" onSignedIn={onSignedIn} />);

    await waitFor(() => expect(onSignedIn).toHaveBeenCalledWith('/'));
  });

  it('explains a link opened in another browser', async () => {
    server.use(
      http.post(`${testApi}/api/identity/email/complete`, () =>
        HttpResponse.json({ status: 403, code: 'identity.magic_link_other_browser' }, { status: 403 }),
      ),
    );

    renderWithProviders(<CompleteEmailSignIn token="t" next="/" onSignedIn={vi.fn()} />, 'ru');

    expect(await screen.findByRole('alert')).toHaveTextContent('Откройте ссылку в том же браузере');
    expect(screen.getByRole('link', { name: 'Вернуться ко входу' })).toHaveAttribute('href', '/sign-in?next=%2F');
  });
});

describe('CompleteExternalSignIn', () => {
  it('shows the error code the API put on the return URL', async () => {
    const onSignedIn = vi.fn();

    renderWithProviders(<CompleteExternalSignIn error="identity.login_already_linked" next="/profile" onSignedIn={onSignedIn} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('This sign-in method already belongs to another account');
    expect(onSignedIn).not.toHaveBeenCalled();
  });

  it('continues when there is no error', async () => {
    const onSignedIn = vi.fn();

    renderWithProviders(<CompleteExternalSignIn error={undefined} next="/profile" onSignedIn={onSignedIn} />);

    await waitFor(() => expect(onSignedIn).toHaveBeenCalledWith('/profile'));
  });
});
