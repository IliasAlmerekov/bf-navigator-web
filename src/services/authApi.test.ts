import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthResponse, RegisterRequest, UserDTO } from '../types/auth';

function createJsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
    },
    ...init,
  });
}

describe('authApi', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses VITE_API_URL for BASE_URL when provided', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.test');

    const { BASE_URL } = await import('./authApi');

    expect(BASE_URL).toBe('https://api.example.test');
  });

  it('falls back to /api when VITE_API_URL is not provided', async () => {
    const { BASE_URL } = await import('./authApi');

    expect(BASE_URL).toBe('/api');
  });

  it('posts login requests and returns the auth response', async () => {
    const authResponse: AuthResponse = { token: 'jwt-token' };
    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse(authResponse));
    vi.stubGlobal('fetch', fetchMock);

    const { login } = await import('./authApi');

    await expect(
      login({
        email: 'max@example.com',
        password: 'secret123',
      })
    ).resolves.toEqual(authResponse);

    expect(fetchMock).toHaveBeenCalledWith('/api/auth/login', {
      body: JSON.stringify({
        email: 'max@example.com',
        password: 'secret123',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
  });

  it('throws InvalidCredentialsError for login 401 responses', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(createJsonResponse({ message: 'Unauthorized' }, { status: 401 }));
    vi.stubGlobal('fetch', fetchMock);

    const { InvalidCredentialsError, login } = await import('./authApi');

    await expect(
      login({
        email: 'max@example.com',
        password: 'wrong-password',
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('posts register requests and returns the created user', async () => {
    const registerRequest: RegisterRequest = {
      accessibilityTypes: ['WHEELCHAIR'],
      email: 'max@example.com',
      firstName: 'Max',
      lastName: 'Mustermann',
      password: 'secret123',
    };
    const user: UserDTO = {
      accessibilityTypes: ['WHEELCHAIR'],
      email: 'max@example.com',
      firstName: 'Max',
      id: 1,
      lastName: 'Mustermann',
    };
    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse(user));
    vi.stubGlobal('fetch', fetchMock);

    const { register } = await import('./authApi');

    await expect(register(registerRequest)).resolves.toEqual(user);

    expect(fetchMock).toHaveBeenCalledWith('/api/auth/register', {
      body: JSON.stringify(registerRequest),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
  });

  it('throws EmailAlreadyTakenError for register 409 responses', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(createJsonResponse({ message: 'Conflict' }, { status: 409 }));
    vi.stubGlobal('fetch', fetchMock);

    const { EmailAlreadyTakenError, register } = await import('./authApi');

    await expect(
      register({
        accessibilityTypes: ['WHEELCHAIR'],
        email: 'max@example.com',
        firstName: 'Max',
        lastName: 'Mustermann',
        password: 'secret123',
      })
    ).rejects.toBeInstanceOf(EmailAlreadyTakenError);
  });

  it('throws ServerError for 5xx responses', async () => {
    const { ServerError, handleResponse } = await import('./authApi');

    await expect(
      handleResponse(createJsonResponse({ message: 'Server error' }, { status: 503 }))
    ).rejects.toBeInstanceOf(ServerError);
  });
});
