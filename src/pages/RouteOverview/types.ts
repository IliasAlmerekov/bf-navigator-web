import type { LucideIcon } from 'lucide-react';

export type RouteStop = {
  label: 'Departure' | 'Arrival';
  time: string;
  station: string;
  platform: string;
};

export type RouteHeroData = {
  confidence: string;
  duration: string;
  eyebrow: string;
  summary: string;
  title: string;
  transfers: string;
  departure: RouteStop;
  arrival: RouteStop;
};

export type TimelineAmenity = {
  icon: LucideIcon;
  label: string;
};

export type TimelineItem = {
  detail: string;
  kind: 'ride' | 'transfer' | 'arrival';
  phase: string;
  station: string;
  statusLabel: string;
  statusTone: 'accent' | 'neutral' | 'warning';
  time: string;
  title: string;
  icon: LucideIcon;
  amenities: TimelineAmenity[];
};

export type StationAccessibilityItem = {
  services: TimelineAmenity[];
  station: string;
  status: 'LIVE' | 'WARNING';
  summary: string;
};

export type RouteHighlight = {
  description: string;
  icon: LucideIcon;
  title: string;
};

export type WeatherSnapshot = {
  condition: string;
  icon: LucideIcon;
  station: string;
  temperature: string;
  time: string;
};
