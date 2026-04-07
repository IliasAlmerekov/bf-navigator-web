import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TrainRouteResponse } from '../types';
import { TrainResultCard } from './TrainResultCard';

function formatExpectedLocalTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function makeRoute(overrides?: Partial<TrainRouteResponse>): TrainRouteResponse {
  return {
    accessibilitySummary: {
      activeElevators: 1,
      activeEscalators: 0,
      inactiveElevators: 0,
      inactiveEscalators: 0,
      mobilityServiceStations: 2,
      status: 'ACCESSIBLE',
      stepFreeStations: 2,
      summary: '2/2 stations step-free',
      totalStations: 2,
    },
    arrivalTime: '2026-04-02T10:45:00Z',
    departureTime: '2026-04-02T08:29:00Z',
    destination: 'Braunschweig Hbf',
    localizedDistanceText: '240 km',
    localizedDurationText: '2 Stunden, 20 Minuten',
    origin: 'Hamburg Hbf',
    transits: [
      {
        agencyName: 'DB Fernverkehr AG',
        arrival: {
          arrivalTime: '2026-04-02T09:48:00Z',
          facilities: [],
          station: {
            category: 1,
            city: 'Hannover',
            evaNumber: 8000152,
            hasMobilityService: 'yes',
            hasSteplessAccess: 'yes',
            hasWiFi: true,
            name: 'Hannover Hbf',
            number: 23456,
          },
          stationName: 'Hannover Hauptbahnhof',
        },
        departure: {
          departureTime: '2026-04-02T08:29:00Z',
          facilities: [],
          station: {
            category: 1,
            city: 'Hamburg',
            evaNumber: 8002549,
            hasMobilityService: 'yes',
            hasSteplessAccess: 'yes',
            hasWiFi: true,
            name: 'Hamburg Hbf',
            number: 12345,
          },
          stationName: 'Hamburg Hauptbahnhof',
        },
        trainName: 'ICE 579',
        vehicleType: 'Hochgeschwindigkeitszug',
      },
    ],
    ...overrides,
  };
}

describe('TrainResultCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders local user-facing times and visible transit metadata from the backend DTO', () => {
    render(<TrainResultCard route={makeRoute()} onSelect={vi.fn()} />);

    expect(screen.getByText('ICE 579')).toBeInTheDocument();
    expect(screen.getByText('2 Stunden, 20 Minuten')).toBeInTheDocument();
    expect(screen.getByText('Hamburg Hauptbahnhof')).toBeInTheDocument();
    expect(screen.getByText('Hannover Hauptbahnhof')).toBeInTheDocument();
    expect(screen.getByText(formatExpectedLocalTime('2026-04-02T08:29:00Z'))).toBeInTheDocument();
    expect(screen.getByText(formatExpectedLocalTime('2026-04-02T09:48:00Z'))).toBeInTheDocument();
    expect(screen.getByText('DB Fernverkehr AG · Hochgeschwindigkeitszug')).toBeInTheDocument();
    expect(screen.getByText('Direkt')).toBeInTheDocument();
  });

  it('renders accessibility signals from the backend summary with visible text labels', () => {
    render(<TrainResultCard route={makeRoute()} onSelect={vi.fn()} />);

    expect(screen.getByText('Stufenfrei 2/2', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('Mobilitätsservice 2/2', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('Aufzüge 1 aktiv', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('Rolltreppen keine Daten', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('2/2 stations step-free', { selector: 'p' })).toBeInTheDocument();
  });

  it('exposes understandable screen-reader labels for accessibility badges', () => {
    render(
      <TrainResultCard
        route={makeRoute({
          accessibilitySummary: {
            activeElevators: 1,
            activeEscalators: 0,
            inactiveElevators: 1,
            inactiveEscalators: 2,
            mobilityServiceStations: 1,
            status: 'LIMITED',
            stepFreeStations: 1,
            summary: '1/2 stations step-free',
            totalStations: 2,
          },
        })}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Stufenfreier Zugang an 1 von 2 Stationen')).toBeInTheDocument();
    expect(screen.getByLabelText('Mobilitätsservice an 1 von 2 Stationen')).toBeInTheDocument();
    expect(screen.getByLabelText('Aufzüge: 1 aktiv, 1 außer Betrieb')).toBeInTheDocument();
    expect(screen.getByLabelText('Rolltreppen: 2 außer Betrieb')).toBeInTheDocument();
    expect(screen.getByLabelText(/Barrierefreiheit: 1\/2 stations step-free/i)).toBeInTheDocument();
  });

  it('renders departure and arrival stops in separate labeled blocks for compact layouts', () => {
    render(<TrainResultCard route={makeRoute()} onSelect={vi.fn()} />);

    expect(screen.getByText('Von')).toBeInTheDocument();
    expect(screen.getByText('Nach')).toBeInTheDocument();
    expect(screen.getByText('Hamburg Hauptbahnhof')).toBeInTheDocument();
    expect(screen.getByText('Hannover Hauptbahnhof')).toBeInTheDocument();
  });
});
