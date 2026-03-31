import type { ReactNode } from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RouteOverview from './RouteOverview';

afterEach(() => {
  cleanup();
});

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    className,
    to,
    'aria-label': ariaLabel,
  }: {
    children: ReactNode;
    className?: string;
    to: string;
    'aria-label'?: string;
  }) => (
    <a className={className} href={to} aria-label={ariaLabel}>
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
        level: 2,
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

  it('does not render "View Full Route Map" link', () => {
    render(<RouteOverview />);

    expect(screen.queryByRole('link', { name: /view full route map/i })).not.toBeInTheDocument();
  });

  it('renders "View Alternatives" link pointing to /train-search-results', () => {
    render(<RouteOverview />);

    const link = screen.getByRole('link', { name: /return to search results/i });
    expect(link).toHaveAttribute('href', '/train-search-results');
  });

  it('renders "Live Navigation" link', () => {
    render(<RouteOverview />);

    expect(screen.getByRole('link', { name: /live navigation/i })).toBeInTheDocument();
  });

  it('renders the station services section heading', () => {
    render(<RouteOverview />);

    expect(screen.getByRole('heading', { name: /station services/i })).toBeInTheDocument();
  });

  it('renders "Lift out of service" warning for Berlin Hbf', () => {
    render(<RouteOverview />);

    expect(screen.getByText(/lift out of service/i)).toBeInTheDocument();
  });

  it('renders the elevator platform label Gleis 11 for Berlin Hbf', () => {
    render(<RouteOverview />);

    const servicesSection = screen.getByRole('region', { name: /station services/i });
    expect(within(servicesSection).getByText(/gleis 11/i)).toBeInTheDocument();
  });

  it('does not announce anything on initial load', () => {
    render(<RouteOverview />);

    const liveEl = document.querySelector('[aria-live="polite"]');
    expect(liveEl?.textContent).toBe('');
  });

  it('announces when route is saved and updates aria-pressed', async () => {
    render(<RouteOverview />);

    const saveButton = screen.getByRole('button', { name: /save route/i });
    expect(saveButton).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(saveButton);

    expect(saveButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/route saved to your trips/i)).toBeInTheDocument();
  });

  it('renders sr-only unavailable label for out-of-service amenities', () => {
    render(<RouteOverview />);

    const unavailableLabels = screen.getAllByText('(unavailable)');
    expect(unavailableLabels.length).toBeGreaterThan(0);
  });

  it('shows gleis label next to unavailable service chip', () => {
    render(<RouteOverview />);

    expect(screen.getByText(/escalators — gleis 7/i)).toBeInTheDocument();
  });
});
