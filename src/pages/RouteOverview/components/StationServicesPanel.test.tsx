import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StationServicesPanel } from './StationServicesPanel';
import type { RouteStationServicesPanel } from '../types';

const availablePanel: RouteStationServicesPanel = {
  elevatorCard: {
    availableUnits: 2,
    description: 'Der Aufzug läuft im Normalbetrieb.',
    outOfServiceUnits: 0,
    status: 'available',
    title: 'Bahnhofsbarrierefreiheit',
    totalUnits: 2,
  },
  lastUpdated: 'Gerade aktualisiert',
  liveEquipmentCards: [
    {
      availableUnits: 2,
      id: 'elevators',
      outOfServiceUnits: 0,
      status: 'available',
      summary: 'Alle in Betrieb',
      totalUnits: 2,
      title: 'Aufzüge',
    },
    {
      availableUnits: 4,
      id: 'escalators',
      outOfServiceUnits: 0,
      status: 'available',
      summary: 'Alle in Betrieb',
      totalUnits: 4,
      title: 'Rolltreppen',
    },
    {
      availableUnits: 1,
      id: 'tactile_guidance',
      outOfServiceUnits: 0,
      status: 'available',
      summary: 'Im gesamten Bahnhof aktiv',
      totalUnits: 1,
      title: 'Taktiles Leitsystem',
    },
    {
      availableUnits: 1,
      id: 'accessible_toilets',
      outOfServiceUnits: 0,
      status: 'available',
      summary: 'Euro-Schlüssel erforderlich',
      totalUnits: 1,
      title: 'Barrierefreie Toiletten',
    },
  ],
  stationId: 'frankfurt-main-hbf',
  stationName: 'Frankfurt (Main) Hbf',
};

describe('StationServicesPanel', () => {
  it('renders the normal elevator state without rerouted guidance', () => {
    render(<StationServicesPanel panel={availablePanel} />);

    const stationAccessibilityCard = screen
      .getByRole('heading', { level: 3, name: /bahnhofsbarrierefreiheit/i })
      .closest('article');

    expect(stationAccessibilityCard).not.toBeNull();

    if (!stationAccessibilityCard) {
      throw new Error('Station accessibility card was not rendered.');
    }

    expect(
      within(stationAccessibilityCard).getByText(/der aufzug läuft im normalbetrieb/i)
    ).toBeInTheDocument();
    expect(within(stationAccessibilityCard).getByText(/2 anlagen/i)).toBeInTheDocument();
    expect(within(stationAccessibilityCard).getByText(/2 in betrieb/i)).toBeInTheDocument();
    expect(within(stationAccessibilityCard).getByText(/0 außer betrieb/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /bahnhofsservice/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /live-anlagenstatus/i })
    ).toBeInTheDocument();
    expect(screen.queryByText(/umgeleitete route/i)).not.toBeInTheDocument();
  });
});
