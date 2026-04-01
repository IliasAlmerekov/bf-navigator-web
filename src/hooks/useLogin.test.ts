import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockNavigate = vi.fn();
const loginMock = vi.fn();
const storeTokenMock = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../services/authApi', () => {
  class InvalidCredentialsError extends Error {
    constructor(message = 'Invalid credentials') {
      super(message);
      this.name = 'InvalidCredentialsError';
    }
  }

  return {
    InvalidCredentialsError,
    login: loginMock,
  };
});

vi.mock('../utils/tokenStorage', () => ({
  storeToken: storeTokenMock,
}));

describe('useLogin', () => {
  beforeEach(() => {
    loginMock.mockReset();
    storeTokenMock.mockReset();
    mockNavigate.mockReset();
    mockNavigate.mockResolvedValue(undefined);
  });

  it('starts with an idle state', async () => {
    const { useLogin } = await import('./useLogin');
    const { result } = renderHook(() => useLogin());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets loading, stores the token, and navigates home after successful login', async () => {
    let resolveLogin: ((value: { token: string }) => void) | undefined;
    loginMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        })
    );

    const { useLogin } = await import('./useLogin');
    const { result } = renderHook(() => useLogin());

    let loginPromise: Promise<void> | undefined;

    await act(async () => {
      loginPromise = result.current.login('max@example.com', 'secret123');
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    resolveLogin?.({ token: 'jwt-token' });
    await act(async () => {
      await loginPromise;
    });

    expect(loginMock).toHaveBeenCalledWith({
      email: 'max@example.com',
      password: 'secret123',
    });
    expect(storeTokenMock).toHaveBeenCalledWith('jwt-token');
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets a german error message for invalid credentials', async () => {
    const { InvalidCredentialsError } = await import('../services/authApi');
    const invalidCredentialsError = new InvalidCredentialsError();
    loginMock.mockRejectedValue(invalidCredentialsError);

    const { useLogin } = await import('./useLogin');
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await expect(result.current.login('max@example.com', 'wrong-password')).rejects.toBe(
        invalidCredentialsError
      );
    });

    await waitFor(() => {
      expect(result.current.error).toBe('E-Mail oder Passwort ungültig');
    });
    expect(storeTokenMock).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('clears the previous error at the start of a new attempt', async () => {
    const { InvalidCredentialsError } = await import('../services/authApi');
    loginMock.mockRejectedValueOnce(new InvalidCredentialsError()).mockResolvedValueOnce({
      token: 'jwt-token',
    });

    const { useLogin } = await import('./useLogin');
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await expect(
        result.current.login('max@example.com', 'wrong-password')
      ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });

    await waitFor(() => {
      expect(result.current.error).toBe('E-Mail oder Passwort ungültig');
    });

    let nextAttempt: Promise<void> | undefined;

    await act(async () => {
      nextAttempt = result.current.login('max@example.com', 'secret123');
    });

    expect(result.current.error).toBeNull();

    await act(async () => {
      await nextAttempt;
    });

    expect(result.current.error).toBeNull();
  });
});
