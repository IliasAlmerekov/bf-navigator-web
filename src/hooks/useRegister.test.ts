import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessibilityType, type RegisterRequest } from '../types/auth';

const mockNavigate = vi.fn();
const registerMock = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../services/authApi', () => {
  class EmailAlreadyTakenError extends Error {
    constructor(message = 'Email already taken') {
      super(message);
      this.name = 'EmailAlreadyTakenError';
    }
  }

  return {
    EmailAlreadyTakenError,
    register: registerMock,
  };
});

const registerRequest: RegisterRequest = {
  accessibilityTypes: [AccessibilityType.WHEELCHAIR],
  email: 'max@example.com',
  firstName: 'Max',
  lastName: 'Mustermann',
  password: 'secret123',
};

describe('useRegister', () => {
  beforeEach(() => {
    registerMock.mockReset();
    mockNavigate.mockReset();
    mockNavigate.mockResolvedValue(undefined);
  });

  it('starts with an idle state', async () => {
    const { useRegister } = await import('./useRegister');
    const { result } = renderHook(() => useRegister());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets loading and navigates to login after successful registration', async () => {
    let resolveRegister: (() => void) | undefined;
    registerMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRegister = () => resolve(undefined);
        })
    );

    const { useRegister } = await import('./useRegister');
    const { result } = renderHook(() => useRegister());

    let registerPromise: Promise<void> | undefined;

    await act(async () => {
      registerPromise = result.current.register(registerRequest);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    resolveRegister?.();
    await act(async () => {
      await registerPromise;
    });

    expect(registerMock).toHaveBeenCalledWith(registerRequest);
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets a german error message for duplicate emails', async () => {
    const { EmailAlreadyTakenError } = await import('../services/authApi');
    const emailAlreadyTakenError = new EmailAlreadyTakenError();
    registerMock.mockRejectedValue(emailAlreadyTakenError);

    const { useRegister } = await import('./useRegister');
    const { result } = renderHook(() => useRegister());

    await act(async () => {
      await expect(result.current.register(registerRequest)).rejects.toBe(emailAlreadyTakenError);
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Diese E-Mail-Adresse ist bereits vergeben');
    });
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('clears the previous error at the start of a new attempt', async () => {
    const { EmailAlreadyTakenError } = await import('../services/authApi');
    registerMock
      .mockRejectedValueOnce(new EmailAlreadyTakenError())
      .mockResolvedValueOnce(undefined);

    const { useRegister } = await import('./useRegister');
    const { result } = renderHook(() => useRegister());

    await act(async () => {
      await expect(result.current.register(registerRequest)).rejects.toBeInstanceOf(
        EmailAlreadyTakenError
      );
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Diese E-Mail-Adresse ist bereits vergeben');
    });

    let nextAttempt: Promise<void> | undefined;

    await act(async () => {
      nextAttempt = result.current.register(registerRequest);
    });

    expect(result.current.error).toBeNull();

    await act(async () => {
      await nextAttempt;
    });

    expect(result.current.error).toBeNull();
  });
});
