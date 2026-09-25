export type ProblemErrors = Record<string, string[]>;

// Status 0 means the request never reached the API; code is absent for status-only answers such as a middleware 401 or a 500.
export class ApiProblem extends Error {
  readonly status: number;
  readonly code: string | undefined;
  readonly errors: ProblemErrors;

  constructor(status: number, code: string | undefined, errors: ProblemErrors = {}) {
    super(code ?? `http_${status}`);
    this.name = 'ApiProblem';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

let baseUrl = '';

export function configureApi(options: { baseUrl: string }): void {
  baseUrl = options.baseUrl.replace(/\/+$/, '');
}

export function apiUrl(path: string): string {
  return `${baseUrl}${path}`;
}

// orval reads these two names from the mutator module to type errors and bodies.
export type ErrorType<_Error> = ApiProblem;
export type BodyType<Body> = Body;

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(apiUrl(url), { ...options, credentials: 'include' });
  } catch {
    throw new ApiProblem(0, undefined);
  }

  const body = parseJson(await response.text());
  if (!response.ok) {
    throw toProblem(response.status, body);
  }

  return body as T;
}

function parseJson(text: string): unknown {
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function toProblem(status: number, body: unknown): ApiProblem {
  if (typeof body !== 'object' || body === null) {
    return new ApiProblem(status, undefined);
  }

  const { code, errors } = body as { code?: unknown; errors?: unknown };
  return new ApiProblem(
    status,
    typeof code === 'string' ? code : undefined,
    typeof errors === 'object' && errors !== null ? (errors as ProblemErrors) : {},
  );
}
