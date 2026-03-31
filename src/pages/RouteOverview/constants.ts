import { BusFront, Footprints, Utensils, Wifi } from 'lucide-react';
import type { RouteHeroData, RouteStationServicesPanel, TimelineItem } from './types';

export const ROUTE_HERO: RouteHeroData = {
  confidence: '98%',
  duration: '4h 15m',
  eyebrow: '',
  title: '',
  transfers: '1 transfer',
  departure: {
    label: 'Departure',
    station: 'Frankfurt Hbf',
    time: '09:30',
  },
  arrival: {
    label: 'Arrival',
    station: 'Berlin Hbf',
    time: '13:45',
  },
};

export const ROUTE_TIMELINE: TimelineItem[] = [
  {
    amenities: [
      { icon: Wifi, label: 'Free WiFi' },
      { icon: Utensils, label: 'Bistro' },
    ],
    kind: 'departure',
    label: 'DEPARTURE',
    platformInfo: 'Platform 9 · Main Entrance',
    station: 'Frankfurt (Main) Hbf',
    time: '09:30',
  },
  {
    amenities: [],
    kind: 'transfer',
    label: 'DEPARTING',
    platformInfo: 'Platform 4 · Arriving 10:52',
    station: 'Kassel-Wilhelmshöhe',
    time: '11:14',
    transferNote: '22 MIN TRANSFER',
    transferTrain: 'Switching to ICE884',
  },
  {
    amenities: [
      { icon: BusFront, label: 'Transit Links' },
      { icon: Footprints, label: 'Step-free' },
    ],
    kind: 'arrival',
    label: 'ARRIVAL',
    platformInfo: 'Platform 11–14 · Lower Level',
    station: 'Berlin Hbf',
    time: '13:45',
  },
];

export const ROUTE_STATION_SERVICES_PANEL: RouteStationServicesPanel = {
  elevatorCard: {
    alternateRoute: 'Use the Platform 9 elevator and cross via Sector C to reach platforms 11-14.',
    availableUnits: 11,
    description:
      'Platform 11 elevator is currently unavailable. Maintenance is in progress and step-free routing has been adjusted.',
    outOfServiceUnits: 1,
    status: 'out_of_service',
    title: 'Station Accessibility',
    totalUnits: 12,
  },
  lastUpdated: 'Updated 1 minute ago',
  liveEquipmentCards: [
    {
      availableUnits: 11,
      id: 'elevators',
      outOfServiceUnits: 1,
      status: 'unavailable',
      summary: 'Platform 11 elevator unavailable',
      totalUnits: 12,
      title: 'Elevators',
    },
    {
      availableUnits: 5,
      id: 'escalators',
      outOfServiceUnits: 1,
      status: 'limited',
      summary: '1 outage on Gleis 4',
      totalUnits: 6,
      title: 'Escalators',
    },
    {
      availableUnits: 1,
      id: 'tactile_guidance',
      outOfServiceUnits: 0,
      status: 'available',
      summary: 'Active throughout the concourse and all transfer paths',
      totalUnits: 1,
      title: 'Tactile Guidance',
    },
    {
      availableUnits: 2,
      id: 'accessible_toilets',
      outOfServiceUnits: 0,
      status: 'available',
      summary: 'Euro-key required',
      totalUnits: 2,
      title: 'Accessible Toilets',
    },
  ],
  stationId: 'berlin-hbf',
  stationName: 'Berlin Hbf',
};
