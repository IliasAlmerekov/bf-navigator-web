import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Register from './Register';

const mockNavigate = vi.fn();
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
  useNavigate: () => mockNavigate,
}));

describe('Register', () => {
  beforeEach(() => {
    window.localStorage.removeItem(HAS_COMPLETED_ONBOARDING_STORAGE_KEY);
    mockNavigate.mockReset();
    mockNavigate.mockResolvedValue(undefined);
  });

  it('stores the onboarding completion flag before navigating to login after successful registration', async () => {
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
      target: { value: 'supersecret' },
    });
    fireEvent.change(screen.getByLabelText('Passwort Bestätigen'), {
      target: { value: 'supersecret' },
    });
    await user.click(
      screen.getByRole('checkbox', { name: /ich stimme den nutzungsbedingungen zu/i })
    );
    fireEvent.click(screen.getByRole('button', { name: /konto erstellen/i }));

    await waitFor(
      () => {
        expect(window.localStorage.getItem(HAS_COMPLETED_ONBOARDING_STORAGE_KEY)).toBe('true');
      },
      { timeout: 2000 }
    );

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' });
  });
});
