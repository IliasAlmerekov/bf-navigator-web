import type { ReactNode } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LiveNavigation from './LiveNavigation';

const liveNavigationMapMock = vi.fn();
const watchPositionMock = vi.fn();
const clearWatchMock = vi.fn();

type WatchSuccess = Parameters<typeof navigator.geolocation.watchPosition>[0];
type WatchError = Parameters<typeof navigator.geolocation.watchPosition>[1];

let watchSuccessCallback: WatchSuccess | undefined;
let watchErrorCallback: WatchError | undefined;

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
}));

vi.mock('./components/LiveNavigationMap', () => ({
  LiveNavigationMap: (props: unknown) => {
    liveNavigationMapMock(props);
    return <div data-testid="live-navigation-map" />;
  },
}));

describe('LiveNavigation', () => {
  afterEach(() => {
    cleanup();
    liveNavigationMapMock.mockReset();
    watchPositionMock.mockReset();
    clearWatchMock.mockReset();
    watchSuccessCallback = undefined;
    watchErrorCallback = undefined;
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    Object.defineProperty(window.navigator, 'geolocation', {
      configurable: true,
      value: {
        clearWatch: clearWatchMock,
        getCurrentPosition: vi.fn(),
        watchPosition: watchPositionMock.mockImplementation(
          (success: WatchSuccess, error: WatchError) => {
            watchSuccessCallback = success;
            watchErrorCallback = error;

            return 17;
          }
        ),
      },
    });
  });

  it('requests browser geolocation on mount and announces the pending status politely', () => {
    render(<LiveNavigation />);

    expect(watchPositionMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('status')).toHaveTextContent(/standort wird ermittelt/i);
  });

  it('renders text-first live guidance after the browser reports a position', () => {
    render(<LiveNavigation />);

    watchSuccessCallback?.({
      coords: {
        accuracy: 5,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        latitude: 50.10736,
        longitude: 8.66312,
        speed: null,
      },
      timestamp: Date.now(),
    } as GeolocationPosition);

    expect(
      screen.getByRole('heading', { level: 1, name: /live navigation zu gleis 1/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/aktueller orientierungspunkt: aufzug e4/i)).toBeInTheDocument();
    expect(screen.getByText(/folgen sie dem leitsystem bis zum aufzug e4/i)).toBeInTheDocument();
    expect(screen.getByText(/gleis 1/i)).toBeInTheDocument();
    expect(liveNavigationMapMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        destinationLabel: 'Gleis 1',
      })
    );
  });

  it('shows manual fallback controls when geolocation permission is denied', async () => {
    const user = userEvent.setup();
    render(<LiveNavigation />);

    watchErrorCallback?.({
      code: 1,
      message: 'Permission denied',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError);

    expect(screen.getByRole('status')).toHaveTextContent(/standortfreigabe wurde abgelehnt/i);
    expect(
      screen.getByRole('radiogroup', { name: /manuellen startpunkt wählen/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /info point/i }));

    expect(screen.getByText(/startpunkt: info point/i)).toBeInTheDocument();
    expect(screen.getByText(/biegen sie links ab/i)).toBeInTheDocument();
  });

  it('falls back immediately when browser geolocation is unavailable', () => {
    Object.defineProperty(window.navigator, 'geolocation', {
      configurable: true,
      value: undefined,
    });

    render(<LiveNavigation />);

    expect(screen.getByRole('status')).toHaveTextContent(
      /geolokalisierung ist in diesem browser nicht verfügbar/i
    );
    expect(
      screen.getByRole('radiogroup', { name: /manuellen startpunkt wählen/i })
    ).toBeInTheDocument();
  });

  it('clears the geolocation watcher on unmount', () => {
    const view = render(<LiveNavigation />);

    view.unmount();

    expect(clearWatchMock).toHaveBeenCalledWith(17);
  });
});
