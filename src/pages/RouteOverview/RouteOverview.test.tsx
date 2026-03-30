import type { ReactNode } from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RouteOverview from './RouteOverview';

afterEach(() => {
  cleanup();
});

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, className, to }: { children: ReactNode; className?: string; to: string }) => (
    <a className={className} href={to}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
}));

describe('RouteOverview', () => {
  it('renders the detailed timeline heading and train badges', () => {
    render(<RouteOverview />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /detailed timeline/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText(/on time/i)).toBeInTheDocument();
    expect(screen.getByText('ICE772')).toBeInTheDocument();
  });

  it('renders the journey timeline with all three stations', () => {
    render(<RouteOverview />);

    const timeline = screen.getByRole('list', { name: /journey timeline/i });

    expect(timeline).toBeInTheDocument();
    expect(within(timeline).getByText('Frankfurt (Main) Hbf')).toBeInTheDocument();
    expect(within(timeline).getByText('Kassel-Wilhelmshöhe')).toBeInTheDocument();
    expect(within(timeline).getByText('Berlin Hbf')).toBeInTheDocument();
  });

  it('renders station platform info and departure times', () => {
    render(<RouteOverview />);
    const timeline = screen.getByRole('list', { name: /journey timeline/i });

    expect(screen.getByText(/platform 9 · main entrance/i)).toBeInTheDocument();
    expect(within(timeline).getAllByText('09:30').length).toBeGreaterThan(0);
    expect(within(timeline).getAllByText('13:45').length).toBeGreaterThan(0);
  });

  it('renders the transfer note for Kassel', () => {
    render(<RouteOverview />);

    expect(screen.getByText(/22 min transfer/i)).toBeInTheDocument();
    expect(screen.getByText(/switching to ice884/i)).toBeInTheDocument();
  });

  it('renders amenity tags for departure and arrival stations', () => {
    render(<RouteOverview />);
    const timeline = screen.getByRole('list', { name: /journey timeline/i });

    expect(within(timeline).getByText('Free WiFi')).toBeInTheDocument();
    expect(within(timeline).getByText('Bistro')).toBeInTheDocument();
    expect(within(timeline).getByText('Transit Links')).toBeInTheDocument();
    expect(within(timeline).getByText('Step-free')).toBeInTheDocument();
  });

  it('exposes primary route actions for details and alternatives', () => {
    render(<RouteOverview />);

    expect(screen.getByRole('link', { name: /view full route map/i })).toHaveAttribute(
      'href',
      '/route-details'
    );
    expect(screen.getByRole('link', { name: /view alternatives/i })).toHaveAttribute(
      'href',
      '/alternative-routes'
    );
  });
});
