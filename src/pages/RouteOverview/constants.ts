import {
  Accessibility,
  ArrowRightLeft,
  BellRing,
  BusFront,
  CloudSnow,
  Footprints,
  Gauge,
  HandHeart,
  Leaf,
  MapPinned,
  ShieldCheck,
  TrainFront,
  TriangleAlert,
  Utensils,
  Wifi,
} from 'lucide-react';
import type {
  RouteHeroData,
  RouteHighlight,
  StationAccessibilityItem,
  TimelineItem,
  WeatherSnapshot,
} from './types';

export const ROUTE_HERO: RouteHeroData = {
  confidence: '98%',
  duration: '4h 15m',
  eyebrow: 'Best barrier-free option',
  summary:
    'Frankfurt Hbf to Berlin Hbf with one transfer, step-free routing and a live station check before every platform change.',
  title: 'Route Overview',
  transfers: '1 transfer',
  departure: {
    label: 'Departure',
    platform: 'Track 9',
    station: 'Frankfurt Hbf',
    time: '09:30',
  },
  arrival: {
    label: 'Arrival',
    platform: 'Arrival track 4',
    station: 'Berlin Hbf',
    time: '13:45',
  },
};

export const ROUTE_TIMELINE: TimelineItem[] = [
  {
    amenities: [
      { icon: Wifi, label: 'Free WiFi' },
      { icon: Utensils, label: 'Bistro service' },
    ],
    detail: 'Platform 9 · Main entrance · Low-floor boarding support available.',
    icon: TrainFront,
    kind: 'ride',
    phase: 'Departure',
    station: 'Frankfurt (Main) Hbf',
    statusLabel: 'On time · ICE 772',
    statusTone: 'accent',
    time: '09:30',
    title: 'Frankfurt departure',
  },
  {
    amenities: [
      { icon: Accessibility, label: 'Lift access verified' },
      { icon: Footprints, label: '320m assisted path' },
    ],
    detail:
      'Kassel-Wilhelmshöhe · 22 min transfer window via the step-free corridor B and tactile route markings.',
    icon: ArrowRightLeft,
    kind: 'transfer',
    phase: 'Transfer',
    station: 'Kassel-Wilhelmshöhe',
    statusLabel: 'Switch to ICE 884',
    statusTone: 'warning',
    time: '10:52 → 11:14',
    title: 'Accessible transfer',
  },
  {
    amenities: [
      { icon: BusFront, label: 'Transit links' },
      { icon: ShieldCheck, label: 'Step-free exit' },
    ],
    detail: 'Platforms 11-14 · Lower level · Assistance desk available on arrival.',
    icon: TrainFront,
    kind: 'arrival',
    phase: 'Arrival',
    station: 'Berlin Hbf',
    statusLabel: 'Arrival track confirmed',
    statusTone: 'neutral',
    time: '13:45',
    title: 'Berlin arrival',
  },
];

export const STATION_ACCESSIBILITY: StationAccessibilityItem[] = [
  {
    services: [
      { icon: Accessibility, label: 'All elevators functional' },
      { icon: MapPinned, label: 'Tactile guidance active' },
    ],
    station: 'Frankfurt Hbf',
    status: 'LIVE',
    summary: 'All elevators functional. Tactile guidance system active on all platforms.',
  },
  {
    services: [
      { icon: TriangleAlert, label: 'Platform 12 elevator offline' },
      { icon: Accessibility, label: 'Ramp B keeps the route step-free' },
    ],
    station: 'Kassel-Wilhelmshöhe',
    status: 'WARNING',
    summary:
      'Elevator P12 out of service. Step-free path stays available via Ramp B with roughly four extra minutes.',
  },
  {
    services: [
      { icon: Accessibility, label: 'Full step-free access' },
      { icon: HandHeart, label: 'Assistance desk open 24/7' },
    ],
    station: 'Berlin Hbf',
    status: 'LIVE',
    summary: 'Full step-free access available across all levels. Assistance desk open 24/7.',
  },
];

export const ROUTE_HIGHLIGHTS: RouteHighlight[] = [
  {
    description: 'This route emits 84% less CO2 than an equivalent flight between the same cities.',
    icon: Leaf,
    title: 'Green journey',
  },
  {
    description:
      'Reaches up to 300 km/h between Kassel and Berlin while keeping a low-transfer profile.',
    icon: Gauge,
    title: 'High-speed section',
  },
  {
    description:
      'Live disruption monitoring stays active from departure until platform arrival in Berlin.',
    icon: BellRing,
    title: 'Continuous updates',
  },
];

export const DESTINATION_WEATHER: WeatherSnapshot = {
  condition: 'Light sleet expected on arrival. Keep extra time for the lower-level exit ramps.',
  icon: CloudSnow,
  station: 'Berlin',
  temperature: '4°C',
  time: '13:45',
};
