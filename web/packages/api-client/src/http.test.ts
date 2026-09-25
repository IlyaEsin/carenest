import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiProblem, apiFetch, apiUrl, configureApi } from './http';

function respond(status: number, body?: string) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(body ?? null, { status }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

async function problemOf(promise: Promise<unknown>): Promise<ApiProblem> {
  const error = await promise.catch((caught: unknown) => caught);
  expect(error).toBeInstanceOf(ApiProblem);
  return error as ApiProblem;
}

describe('apiFetch', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    configureApi({ baseUrl: '' });
  });

  it('sends cookies and prefixes the configured base URL', async () => {
    configureApi({ baseUrl: 'https://api.example.test/' });
    const fetchMock = respond(200, '{"ok":true}');

    const result = await apiFetch<{ ok: boolean }>('/api/identity/me', { method: 'GET' });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith('https://api.example.test/api/identity/me', { method: 'GET', credentials: 'include' });
  });

  it('returns undefined for an empty success body', async () => {
    respond(204);

    await expect(apiFetch('/api/identity/signout', { method: 'POST' })).resolves.toBeUndefined();
  });

  it('turns a coded problem into ApiProblem with field errors', async () => {
    respond(400, '{"status":400,"code":"validation_failed","errors":{"email":["invalid"]}}');

    const problem = await problemOf(apiFetch('/x'));

    expect(problem.status).toBe(400);
    expect(problem.code).toBe('validation_failed');
    expect(problem.errors).toEqual({ email: ['invalid'] });
  });

  it('keeps the status when the answer carries no code or is not JSON', async () => {
    respond(500, '<html>oops</html>');

    const problem = await problemOf(apiFetch('/x'));

    expect(problem.status).toBe(500);
    expect(problem.code).toBeUndefined();
  });

  it('reports a network failure as status 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    expect((await problemOf(apiFetch('/x'))).status).toBe(0);
  });

  it('builds absolute URLs for browser navigations', () => {
    configureApi({ baseUrl: 'https://api.example.test' });

    expect(apiUrl('/api/identity/external/Google/start')).toBe('https://api.example.test/api/identity/external/Google/start');
  });
});
