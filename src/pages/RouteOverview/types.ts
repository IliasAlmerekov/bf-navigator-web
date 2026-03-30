import type { LucideIcon } from 'lucide-react';

export type RouteStop = {
  label: 'Departure' | 'Arrival';
  time: string;
  station: string;
};

export type RouteHeroData = {
  confidence: string;
  duration: string;
  eyebrow: string;
  title: string;
  transfers: string;
  departure: RouteStop;
  arrival: RouteStop;
};

export type RouteHighlight = {
  description: string;
  icon: LucideIcon;
  title: string;
};

export type TimelineAmenity = {
  icon: LucideIcon;
  label: string;
  serviceStatus?: 'available' | 'limited' | 'unavailable';
};

export type ElevatorStatus = 'available' | 'limited' | 'out_of_service';

export type StationServiceStatus = {
  amenities: TimelineAmenity[];
  elevatorsStatus: ElevatorStatus;
  stationId: string;
  stationName: string;
};

export type TimelineItem = {
  amenities: TimelineAmenity[];
  kind: 'departure' | 'transfer' | 'arrival';
  label: string;
  platformInfo: string;
  station: string;
  time: string;
  transferNote?: string;
  transferTrain?: string;
};

export type StationAccessibilityItem = {
  services: TimelineAmenity[];
  station: string;
  status: 'LIVE' | 'WARNING';
  summary: string;
};
