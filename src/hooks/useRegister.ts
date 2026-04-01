import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { EmailAlreadyTakenError, register as registerRequest } from '../services/authApi';
import type { RegisterRequest } from '../types/auth';

const EMAIL_ALREADY_TAKEN_MESSAGE = 'Diese E-Mail-Adresse ist bereits vergeben';
const GENERIC_REGISTER_ERROR_MESSAGE =
  'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.';

export function useRegister() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function register(data: RegisterRequest): Promise<void> {
    setError(null);
    setIsLoading(true);

    try {
      await registerRequest(data);
      await navigate({ to: '/login' });
    } catch (caughtError) {
      if (caughtError instanceof EmailAlreadyTakenError) {
        setError(EMAIL_ALREADY_TAKEN_MESSAGE);
        throw caughtError;
      }

      setError(GENERIC_REGISTER_ERROR_MESSAGE);
      throw caughtError;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    error,
    isLoading,
    register,
  };
}
