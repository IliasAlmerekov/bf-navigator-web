import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StationServicesPanel } from './StationServicesPanel';
import type { RouteStationServicesPanel } from '../types';

const availablePanel: RouteStationServicesPanel = {
  elevatorCard: {
    availableUnits: 2,
    description: 'The elevator is operating in standard mode.',
    outOfServiceUnits: 0,
    status: 'available',
    title: 'Station Accessibility',
    totalUnits: 2,
  },
  lastUpdated: 'Updated just now',
  liveEquipmentCards: [
    {
      availableUnits: 2,
      id: 'elevators',
      outOfServiceUnits: 0,
      status: 'available',
      summary: 'All active',
      totalUnits: 2,
      title: 'Elevators',
    },
    {
      availableUnits: 4,
      id: 'escalators',
      outOfServiceUnits: 0,
      status: 'available',
      summary: 'All active',
      totalUnits: 4,
      title: 'Escalators',
    },
    {
      availableUnits: 1,
      id: 'tactile_guidance',
      outOfServiceUnits: 0,
      status: 'available',
      summary: 'Active throughout the station',
      totalUnits: 1,
      title: 'Tactile Guidance',
    },
    {
      availableUnits: 1,
      id: 'accessible_toilets',
      outOfServiceUnits: 0,
      status: 'available',
      summary: 'Euro-key required',
      totalUnits: 1,
      title: 'Accessible Toilets',
    },
  ],
  stationId: 'frankfurt-main-hbf',
  stationName: 'Frankfurt (Main) Hbf',
};

describe('StationServicesPanel', () => {
  it('renders the normal elevator state without rerouted guidance', () => {
    render(<StationServicesPanel panel={availablePanel} />);

    const stationAccessibilityCard = screen
      .getByRole('heading', { level: 3, name: /station accessibility/i })
      .closest('article');

    expect(stationAccessibilityCard).not.toBeNull();

    if (!stationAccessibilityCard) {
      throw new Error('Station accessibility card was not rendered.');
    }

    expect(
      within(stationAccessibilityCard).getByText(/the elevator is operating in standard mode/i)
    ).toBeInTheDocument();
    expect(within(stationAccessibilityCard).getByText(/2 units/i)).toBeInTheDocument();
    expect(within(stationAccessibilityCard).getByText(/2 working/i)).toBeInTheDocument();
    expect(within(stationAccessibilityCard).getByText(/0 out of service/i)).toBeInTheDocument();
    expect(screen.queryByText(/rerouted path/i)).not.toBeInTheDocument();
  });
});
