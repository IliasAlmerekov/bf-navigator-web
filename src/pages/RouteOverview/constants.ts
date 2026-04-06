import { BusFront, Footprints, Utensils, Wifi } from 'lucide-react';
import type { RouteHeroData, RouteStationServicesPanel, TimelineItem } from './types';

export const ROUTE_HERO: RouteHeroData = {
  confidence: '98%',
  duration: '4 Std. 15 Min.',
  eyebrow: '',
  title: '',
  transfers: '1 Umstieg',
  departure: {
    label: 'Abfahrt',
    station: 'Frankfurt Hbf',
    time: '09:30',
  },
  arrival: {
    label: 'Ankunft',
    station: 'Berlin Hbf',
    time: '13:45',
  },
};

export const ROUTE_TIMELINE: TimelineItem[] = [
  {
    amenities: [
      { icon: Wifi, label: 'Kostenloses WLAN' },
      { icon: Utensils, label: 'Bistro' },
    ],
    kind: 'departure',
    label: 'ABFAHRT',
    platformInfo: 'Gleis 9 · Haupteingang',
    station: 'Frankfurt (Main) Hbf',
    time: '09:30',
  },
  {
    amenities: [],
    kind: 'transfer',
    label: 'UMSTIEG',
    platformInfo: 'Gleis 4 · Ankunft 10:52',
    station: 'Kassel-Wilhelmshöhe',
    time: '11:14',
    transferNote: '22 MIN. UMSTIEG',
    transferTrain: 'Weiter mit ICE884',
  },
  {
    amenities: [
      { icon: BusFront, label: 'Nahverkehrsanschlüsse' },
      { icon: Footprints, label: 'Stufenfrei' },
    ],
    kind: 'arrival',
    label: 'ANKUNFT',
    platformInfo: 'Gleis 11–14 · Untere Ebene',
    station: 'Berlin Hbf',
    time: '13:45',
  },
];

export const ROUTE_STATION_SERVICES_PANEL: RouteStationServicesPanel = {
  elevatorCard: {
    alternateRoute:
      'Nutze den Aufzug an Gleis 9 und wechsle über Abschnitt C zu den Gleisen 11–14.',
    availableUnits: 11,
    description:
      'Der Aufzug an Gleis 11 ist derzeit nicht verfügbar. Die Wartung läuft und die stufenfreie Wegeführung wurde angepasst.',
    outOfServiceUnits: 1,
    status: 'out_of_service',
    title: 'Bahnhofsbarrierefreiheit',
    totalUnits: 12,
  },
  lastUpdated: 'Vor 1 Minute aktualisiert',
  liveEquipmentCards: [
    {
      availableUnits: 11,
      id: 'elevators',
      outOfServiceUnits: 1,
      status: 'unavailable',
      summary: 'Aufzug an Gleis 11 außer Betrieb',
      totalUnits: 12,
      title: 'Aufzüge',
    },
    {
      availableUnits: 5,
      id: 'escalators',
      outOfServiceUnits: 1,
      status: 'limited',
      summary: '1 Ausfall an Gleis 4',
      totalUnits: 6,
      title: 'Rolltreppen',
    },
    {
      availableUnits: 1,
      id: 'tactile_guidance',
      outOfServiceUnits: 0,
      status: 'available',
      summary: 'Durchgehend in der Bahnhofshalle und auf allen Umstiegswegen verfügbar',
      totalUnits: 1,
      title: 'Taktiles Leitsystem',
    },
    {
      availableUnits: 2,
      id: 'accessible_toilets',
      outOfServiceUnits: 0,
      status: 'available',
      summary: 'Euro-Schlüssel erforderlich',
      totalUnits: 2,
      title: 'Barrierefreie Toiletten',
    },
  ],
  stationId: 'berlin-hbf',
  stationName: 'Berlin Hbf',
};
