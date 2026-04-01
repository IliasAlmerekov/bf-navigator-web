import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Register from './Register';

const registerMock = vi.fn();
const useRegisterMock = vi.fn();
const getStoredAccessibilityPreferenceMock = vi.fn();
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

vi.mock('../../hooks/useRegister', () => ({
  useRegister: () => useRegisterMock(),
}));

vi.mock('../../utils/accountStorage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/accountStorage')>();

  return {
    ...actual,
    getStoredAccessibilityPreference: () => getStoredAccessibilityPreferenceMock(),
  };
});

describe('Register', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    window.localStorage.removeItem(HAS_COMPLETED_ONBOARDING_STORAGE_KEY);
    registerMock.mockReset();
    useRegisterMock.mockReset();
    getStoredAccessibilityPreferenceMock.mockReset();
    getStoredAccessibilityPreferenceMock.mockReturnValue(null);
    useRegisterMock.mockReturnValue({
      error: null,
      isLoading: false,
      register: registerMock,
    });
  });

  it('submits registration with mapped accessibility types from onboarding preference', async () => {
    const user = userEvent.setup();
    registerMock.mockResolvedValue(undefined);
    getStoredAccessibilityPreferenceMock.mockReturnValue('vision');

    render(<Register />);

    fireEvent.change(screen.getByLabelText('Vorname'), {
      target: { value: 'Max' },
    });
    fireEvent.change(screen.getByLabelText('Nachname'), {
      target: { value: 'Mustermann' },
    });
    fireEvent.change(screen.getByLabelText('E-Mail Addresse'), {
      target: { value: 'max@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Passwort'), {
      target: { value: 'secret' },
    });
    fireEvent.change(screen.getByLabelText('Passwort Bestätigen'), {
      target: { value: 'secret' },
    });
    await user.click(
      screen.getByRole('checkbox', { name: /ich stimme den nutzungsbedingungen zu/i })
    );
    fireEvent.click(screen.getByRole('button', { name: /konto erstellen/i }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({
        accessibilityTypes: ['VISUAL_IMPAIRMENT'],
        email: 'max@example.com',
        firstName: 'Max',
        lastName: 'Mustermann',
        password: 'secret',
      });
    });

    expect(window.localStorage.getItem(HAS_COMPLETED_ONBOARDING_STORAGE_KEY)).toBe('true');
  });

  it('submits an empty accessibilityTypes array when onboarding preference is stroller', async () => {
    const user = userEvent.setup();
    registerMock.mockResolvedValue(undefined);
    getStoredAccessibilityPreferenceMock.mockReturnValue('stroller');

    render(<Register />);

    fireEvent.change(screen.getByLabelText('Vorname'), {
      target: { value: 'Max' },
    });
    fireEvent.change(screen.getByLabelText('Nachname'), {
      target: { value: 'Mustermann' },
    });
    fireEvent.change(screen.getByLabelText('E-Mail Addresse'), {
      target: { value: 'max@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Passwort'), {
      target: { value: 'secret' },
    });
    fireEvent.change(screen.getByLabelText('Passwort Bestätigen'), {
      target: { value: 'secret' },
    });
    await user.click(
      screen.getByRole('checkbox', { name: /ich stimme den nutzungsbedingungen zu/i })
    );
    fireEvent.click(screen.getByRole('button', { name: /konto erstellen/i }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith(
        expect.objectContaining({
          accessibilityTypes: [],
        })
      );
    });
  });

  it('allows six-character passwords and rejects five-character passwords', async () => {
    const user = userEvent.setup();

    render(<Register />);

    fireEvent.change(screen.getByLabelText('Vorname'), {
      target: { value: 'Max' },
    });
    fireEvent.change(screen.getByLabelText('Nachname'), {
      target: { value: 'Mustermann' },
    });
    fireEvent.change(screen.getByLabelText('E-Mail Addresse'), {
      target: { value: 'max@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Passwort'), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByLabelText('Passwort Bestätigen'), {
      target: { value: '12345' },
    });
    await user.click(
      screen.getByRole('checkbox', { name: /ich stimme den nutzungsbedingungen zu/i })
    );
    fireEvent.click(screen.getByRole('button', { name: /konto erstellen/i }));

    expect(screen.getByText('Passwort mindestens 6 Zeichen')).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Passwort'), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByLabelText('Passwort Bestätigen'), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /konto erstellen/i }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith(
        expect.objectContaining({
          password: '123456',
        })
      );
    });
  });

  it('shows a validation error when passwords do not match', async () => {
    const user = userEvent.setup();

    render(<Register />);

    fireEvent.change(screen.getByLabelText('Vorname'), {
      target: { value: 'Max' },
    });
    fireEvent.change(screen.getByLabelText('Nachname'), {
      target: { value: 'Mustermann' },
    });
    fireEvent.change(screen.getByLabelText('E-Mail Addresse'), {
      target: { value: 'max@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Passwort'), {
      target: { value: 'secret' },
    });
    fireEvent.change(screen.getByLabelText('Passwort Bestätigen'), {
      target: { value: 'different' },
    });
    await user.click(
      screen.getByRole('checkbox', { name: /ich stimme den nutzungsbedingungen zu/i })
    );
    fireEvent.click(screen.getByRole('button', { name: /konto erstellen/i }));

    expect(screen.getByText('Passwörter stimmen nicht überein')).toBeInTheDocument();
    expect(screen.getByLabelText('Passwort')).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByLabelText('Passwort Bestätigen')).toHaveAttribute('aria-invalid', 'true');
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('shows server errors in a polite live region', () => {
    useRegisterMock.mockReturnValue({
      error: 'Diese E-Mail-Adresse ist bereits vergeben',
      isLoading: false,
      register: registerMock,
    });

    render(<Register />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Diese E-Mail-Adresse ist bereits vergeben'
    );
  });

  it('disables submit and announces loading state', () => {
    useRegisterMock.mockReturnValue({
      error: null,
      isLoading: true,
      register: registerMock,
    });

    render(<Register />);

    expect(screen.getByRole('button', { name: /wird erstellt/i })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Registrierung wird durchgeführt');
  });
});
