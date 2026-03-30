import {
  Accessibility,
  ArrowUpDown,
  BusFront,
  Footprints,
  Gauge,
  HandHeart,
  Leaf,
  Toilet,
  Utensils,
  Wifi,
} from 'lucide-react';
import type { RouteHeroData, RouteHighlight, StationServiceStatus, TimelineItem } from './types';

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

export const ROUTE_HIGHLIGHTS: RouteHighlight[] = [
  {
    description: 'This route emits 84% less CO2 than an equivalent flight between the same cities.',
    icon: Leaf,
    title: 'Green journey',
  },
  {
    description: 'Reaches up to 300 km/h between Kassel and Berlin with one transfer.',
    icon: Gauge,
    title: 'High-speed section',
  },
];

export const ROUTE_STATION_SERVICES: StationServiceStatus[] = [
  {
    amenities: [
      { icon: Wifi, label: 'WLAN', serviceStatus: 'available' },
      { icon: ArrowUpDown, label: 'Escalators', serviceStatus: 'unavailable' },
      { icon: Footprints, label: 'Tactile guidance', serviceStatus: 'available' },
      { icon: Toilet, label: 'Accessible toilets', serviceStatus: 'available' },
      { icon: HandHeart, label: 'Assistance desk', serviceStatus: 'available' },
    ],
    elevatorsStatus: 'available',
    stationId: 'frankfurt-main-hbf',
    stationName: 'Frankfurt (Main) Hbf',
  },
  {
    amenities: [
      { icon: Footprints, label: 'Step-free paths', serviceStatus: 'available' },
      { icon: ArrowUpDown, label: 'Escalators', serviceStatus: 'unavailable' },
      { icon: Footprints, label: 'Tactile guidance', serviceStatus: 'available' },
      { icon: Toilet, label: 'Accessible toilets', serviceStatus: 'available' },
      { icon: Accessibility, label: 'Elevators', serviceStatus: 'available' },
    ],
    elevatorsStatus: 'available',
    stationId: 'kassel-wilhelmshoehe',
    stationName: 'Kassel-Wilhelmshöhe',
  },
  {
    amenities: [
      { icon: Wifi, label: 'WLAN', serviceStatus: 'available' },
      { icon: ArrowUpDown, label: 'Escalators', serviceStatus: 'unavailable' },
      { icon: Footprints, label: 'Tactile guidance', serviceStatus: 'available' },
      { icon: Toilet, label: 'Accessible toilets', serviceStatus: 'available' },
      { icon: Accessibility, label: 'Elevators', serviceStatus: 'available' },
    ],
    elevatorsStatus: 'available',
    stationId: 'berlin-hbf',
    stationName: 'Berlin Hbf',
  },
];
