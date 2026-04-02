import type { AuthResponse, LoginRequest, RegisterRequest, UserDTO } from '../types/auth';
import { BASE_URL } from './apiBaseUrl';

export { BASE_URL };

export class InvalidCredentialsError extends Error {
  constructor(message = 'Invalid credentials') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}

export class EmailAlreadyTakenError extends Error {
  constructor(message = 'Email already taken') {
    super(message);
    this.name = 'EmailAlreadyTakenError';
  }
}

export class ServerError extends Error {
  constructor(message = 'Server error') {
    super(message);
    this.name = 'ServerError';
  }
}

export async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    return (await res.json()) as T;
  }

  if (res.status === 401) {
    throw new InvalidCredentialsError();
  }

  if (res.status === 409) {
    throw new EmailAlreadyTakenError();
  }

  if (res.status >= 500) {
    throw new ServerError();
  }

  throw new Error(`Request failed with status ${res.status}`);
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    body: JSON.stringify(request),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  return handleResponse<AuthResponse>(response);
}

export async function register(request: RegisterRequest): Promise<UserDTO> {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    body: JSON.stringify(request),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  return handleResponse<UserDTO>(response);
}
