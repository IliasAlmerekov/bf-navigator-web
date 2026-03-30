import type { ReactNode } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RouteOverview from './RouteOverview';

const mockNavigate = vi.fn();

afterEach(() => {
  cleanup();
  mockNavigate.mockReset();
});

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, className, to }: { children: ReactNode; className?: string; to: string }) => (
    <a className={className} href={to}>
      {children}
    </a>
  ),
  useNavigate: () => mockNavigate,
}));

describe('RouteOverview', () => {
  it('renders the route summary, timeline, and live accessibility sections', () => {
    render(<RouteOverview />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /route overview/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/route snapshot/i)).toHaveTextContent('4h 15m');
    expect(screen.getByLabelText(/route snapshot/i)).toHaveTextContent('98%');

    const timelineHeading = screen.getByRole('heading', {
      level: 2,
      name: /every transfer checked for step-free continuity/i,
    });

    const timelineSection = timelineHeading.closest('section');

    expect(timelineSection).not.toBeNull();
    expect(
      within(timelineSection as HTMLElement).getByText(/frankfurt departure/i)
    ).toBeInTheDocument();
    expect(
      within(timelineSection as HTMLElement).getByText(/accessible transfer/i)
    ).toBeInTheDocument();
    expect(within(timelineSection as HTMLElement).getByText(/berlin arrival/i)).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /live access notes for every station touchpoint/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/elevator p12 out of service/i)).toBeInTheDocument();
  });

  it('navigates back to train search results from the page header', () => {
    render(<RouteOverview />);

    fireEvent.click(screen.getByRole('button', { name: /back to home search/i }));

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
  });

  it('exposes primary route actions for details and alternatives', () => {
    render(<RouteOverview />);

    expect(screen.getByRole('link', { name: /view full route/i })).toHaveAttribute(
      'href',
      '/route-details'
    );
    expect(screen.getByRole('link', { name: /view alternatives/i })).toHaveAttribute(
      'href',
      '/alternative-routes'
    );
  });
});
