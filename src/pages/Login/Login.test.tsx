import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Login from './Login';

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

describe('Login', () => {
  beforeEach(() => {
    window.localStorage.removeItem(HAS_COMPLETED_ONBOARDING_STORAGE_KEY);
    mockNavigate.mockReset();
    mockNavigate.mockResolvedValue(undefined);
  });

  it('stores the onboarding completion flag and navigates home after submit', async () => {
    render(<Login />);

    fireEvent.change(screen.getByLabelText('E-Mail-Adresse'), {
      target: { value: 'max@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Passwort'), {
      target: { value: 'supersecret' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^anmelden$/i }));

    await waitFor(() => {
      expect(window.localStorage.getItem(HAS_COMPLETED_ONBOARDING_STORAGE_KEY)).toBe('true');
    });

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
  });
});
