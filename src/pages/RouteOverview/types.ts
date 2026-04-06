import type { LucideIcon } from 'lucide-react';

export type ServiceAvailability = 'available' | 'limited' | 'unavailable';

export type RouteMapLatLng = [number, number];

export type RouteMapMarkerKind = 'origin' | 'transfer' | 'destination' | 'facility';

export type RouteMapMarkerStatus = ServiceAvailability | 'default';

export type RouteStop = {
  label: string;
  time: string;
  station: string;
};

export type DbStationFacility = {
  description: string;
  equipmentnumber: number;
  geocoordX: number | null;
  geocoordY: number | null;
  operationalResumeDate: string | null;
  operatorname: string;
  state: string;
  stateExplanation: string | null;
  stationnumber: number;
  type: string;
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

export type TimelineAmenity = {
  gleis?: string;
  icon: LucideIcon;
  label: string;
  serviceStatus?: ServiceAvailability;
};

export type ElevatorStatus = 'available' | 'limited' | 'out_of_service';

export type ElevatorStatusCard = {
  alternateRoute?: string;
  availableUnits: number;
  description: string;
  outOfServiceUnits: number;
  status: ElevatorStatus;
  totalUnits: number;
  title: string;
};

export type LiveEquipmentStatusCard = {
  availableUnits: number;
  id: 'accessible_toilets' | 'elevators' | 'escalators' | 'tactile_guidance';
  outOfServiceUnits: number;
  status: ServiceAvailability;
  summary: string;
  totalUnits: number;
  title: string;
};

export type RouteStationServicesPanel = {
  elevatorCard: ElevatorStatusCard;
  lastUpdated: string;
  liveEquipmentCards: LiveEquipmentStatusCard[];
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

export type RouteMapMarker = {
  description?: string;
  id: string;
  kind: RouteMapMarkerKind;
  label: string;
  locationDetail?: string;
  position: RouteMapLatLng;
  statusLabel?: string;
  status: RouteMapMarkerStatus;
};

export type RouteMapData = {
  ariaLabel: string;
  center: RouteMapLatLng;
  markers: RouteMapMarker[];
  maxZoom: number;
  minZoom: number;
  routePath: RouteMapLatLng[];
  zoom: number;
};
