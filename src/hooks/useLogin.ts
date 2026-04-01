import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { InvalidCredentialsError, login as loginRequest } from '../services/authApi';
import { storeToken } from '../utils/tokenStorage';

const INVALID_CREDENTIALS_MESSAGE = 'E-Mail oder Passwort ungültig';
const GENERIC_LOGIN_ERROR_MESSAGE = 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.';

export function useLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(email: string, password: string): Promise<void> {
    setError(null);
    setIsLoading(true);

    try {
      const response = await loginRequest({ email, password });

      storeToken(response.token);
      await navigate({ to: '/' });
    } catch (caughtError) {
      if (caughtError instanceof InvalidCredentialsError) {
        setError(INVALID_CREDENTIALS_MESSAGE);
        throw caughtError;
      }

      setError(GENERIC_LOGIN_ERROR_MESSAGE);
      throw caughtError;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    error,
    isLoading,
    login,
  };
}
