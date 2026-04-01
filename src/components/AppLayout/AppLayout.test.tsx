import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AppLayout from './AppLayout';

const useRouterStateMock = vi.fn();
const getTokenMock = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    className,
    to,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    to: string;
  }) => (
    <a className={className} href={to} {...props}>
      {children}
    </a>
  ),
  useRouterState: (options: { select: (state: { location: { pathname: string } }) => string }) =>
    options.select({ location: { pathname: useRouterStateMock() } }),
}));

vi.mock('../ui/ExpandingSearchDock', () => ({
  ExpandingSearchDock: () => <div data-testid="expanding-search-dock" />,
}));

vi.mock('../../utils/tokenStorage', () => ({
  getToken: () => getTokenMock(),
}));

describe('AppLayout', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    useRouterStateMock.mockReset();
    getTokenMock.mockReset();
    useRouterStateMock.mockReturnValue('/');
    getTokenMock.mockReturnValue(null);
  });

  it('shows login and registration actions for guests', () => {
    render(
      <AppLayout>
        <div>Home</div>
      </AppLayout>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Profilmenü öffnen' }));

    expect(screen.getByRole('menuitem', { name: 'Login' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('menuitem', { name: 'Registration' })).toHaveAttribute(
      'href',
      '/register'
    );
  });

  it('shows a direct profile action instead of login and registration for authenticated users', () => {
    getTokenMock.mockReturnValue('jwt-token');

    render(
      <AppLayout>
        <div>Home</div>
      </AppLayout>
    );

    const profileLink = screen.getByRole('link', { name: 'Profile' });

    expect(profileLink).toHaveAttribute('href', '/profile');
    expect(profileLink).toHaveTextContent('');
    expect(screen.queryByRole('button', { name: 'Profilmenü öffnen' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Login' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Registration' })).not.toBeInTheDocument();
  });
});
