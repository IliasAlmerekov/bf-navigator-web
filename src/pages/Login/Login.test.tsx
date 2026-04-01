import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Login from './Login';

const loginMock = vi.fn();
const useLoginMock = vi.fn();
const HAS_COMPLETED_ONBOARDING_STORAGE_KEY = 'bf-navigator-completed-onboarding';

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    className,
    to,
  }: {
    children: React.ReactNode;
    className?: string;
    to: string;
  }) => (
    <a className={className} href={to}>
      {children}
    </a>
  ),
}));

vi.mock('../../hooks/useLogin', () => ({
  useLogin: () => useLoginMock(),
}));

describe('Login', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    window.localStorage.removeItem(HAS_COMPLETED_ONBOARDING_STORAGE_KEY);
    loginMock.mockReset();
    useLoginMock.mockReset();
    useLoginMock.mockReturnValue({
      error: null,
      isLoading: false,
      login: loginMock,
    });
  });

  it('renders controlled form fields and submits valid credentials', async () => {
    loginMock.mockResolvedValue(undefined);

    render(<Login />);

    const emailInput = screen.getByLabelText('E-Mail-Adresse');
    const passwordInput = screen.getByLabelText('Passwort');

    fireEvent.change(emailInput, {
      target: { value: 'max@example.com' },
    });
    fireEvent.change(passwordInput, {
      target: { value: 'supersecret' },
    });

    expect(emailInput).toHaveValue('max@example.com');
    expect(passwordInput).toHaveValue('supersecret');

    fireEvent.click(screen.getByRole('button', { name: /^anmelden$/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('max@example.com', 'supersecret');
    });

    expect(window.localStorage.getItem(HAS_COMPLETED_ONBOARDING_STORAGE_KEY)).toBe('true');
  });

  it('shows validation errors, sets aria-invalid, and blocks submit when fields are empty', () => {
    render(<Login />);

    fireEvent.click(screen.getByRole('button', { name: /^anmelden$/i }));

    const emailInput = screen.getByLabelText('E-Mail-Adresse');
    const passwordInput = screen.getByLabelText('Passwort');

    expect(screen.getByText('E-Mail-Adresse ist erforderlich')).toBeInTheDocument();
    expect(screen.getByText('Passwort ist erforderlich')).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
    expect(emailInput).toHaveAttribute('aria-describedby', 'login-email-error');
    expect(passwordInput).toHaveAttribute('aria-describedby', 'login-password-error');
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('shows a validation error for invalid email format', () => {
    render(<Login />);

    fireEvent.change(screen.getByLabelText('E-Mail-Adresse'), {
      target: { value: 'not-an-email' },
    });
    fireEvent.change(screen.getByLabelText('Passwort'), {
      target: { value: 'supersecret' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^anmelden$/i }));

    expect(screen.getByText('Bitte geben Sie eine gültige E-Mail-Adresse ein')).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('disables the submit button and announces loading state', () => {
    useLoginMock.mockReturnValue({
      error: null,
      isLoading: true,
      login: loginMock,
    });

    render(<Login />);

    expect(screen.getByRole('button', { name: /^anmelden$/i })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Anmeldung wird durchgeführt');
  });

  it('renders the server error in a polite live region', () => {
    useLoginMock.mockReturnValue({
      error: 'E-Mail oder Passwort ungültig',
      isLoading: false,
      login: loginMock,
    });

    render(<Login />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('status')).toHaveTextContent('E-Mail oder Passwort ungültig');
  });
});
