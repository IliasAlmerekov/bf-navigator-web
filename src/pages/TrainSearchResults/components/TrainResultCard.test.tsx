import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { TrainRouteResponse } from '../types';
import { TrainResultCard } from './TrainResultCard';

function makeRoute(overrides?: Partial<TrainRouteResponse>): TrainRouteResponse {
  return {
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
  it('renders the backend train route DTO without Google route mapping', () => {
    render(<TrainResultCard route={makeRoute()} onSelect={vi.fn()} />);

    expect(screen.getByText('ICE 579')).toBeInTheDocument();
    expect(screen.getByText('2 Stunden, 20 Minuten')).toBeInTheDocument();
    expect(screen.getByText('Hamburg Hauptbahnhof')).toBeInTheDocument();
    expect(screen.getByText('Hannover Hauptbahnhof')).toBeInTheDocument();
    expect(screen.getByText('Direkt')).toBeInTheDocument();
  });
});
