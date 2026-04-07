export type FilterKey =
  | 'all'
  | 'fastest'
  | 'fewest-transfers'
  | 'accessible'
  | 'step-free'
  | 'ice-only';

export interface FilterOption {
  key: FilterKey;
  label: string;
}

export interface TrainRouteFacility {
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
}

export interface TrainRouteStation {
  category: number;
  city: string;
  evaNumber: number;
  hasMobilityService: string;
  hasSteplessAccess: string;
  hasWiFi: boolean;
  name: string;
  number: number;
}

export interface TrainRouteStop {
  arrivalTime?: string;
  departureTime?: string;
  facilities: TrainRouteFacility[];
  station: TrainRouteStation;
  stationName: string;
}

export interface TrainRouteTransit {
  agencyName: string;
  arrival: TrainRouteStop;
  departure: TrainRouteStop;
  trainName: string;
  vehicleType: string;
}

export interface TrainRouteAccessibilitySummary {
  activeElevators: number;
  activeEscalators: number;
  inactiveElevators: number;
  inactiveEscalators: number;
  mobilityServiceStations: number;
  status: 'ACCESSIBLE' | 'LIMITED' | 'UNKNOWN';
  stepFreeStations: number;
  summary: string;
  totalStations: number;
}

export interface TrainRouteStationAccessibility {
  activeElevators: number;
  activeEscalators: number;
  hasFacilityData: boolean;
  inactiveElevators: number;
  inactiveEscalators: number;
  mobilityServiceAvailable: boolean;
  status: 'ACCESSIBLE' | 'LIMITED' | 'UNKNOWN';
  stepFreeAvailable: boolean;
  summary: string;
}

export interface WalkingApproach {
  instruction: string;
  latitude: number;
  longitude: number;
}

export interface StopLocation {
  latitude: number;
  longitude: number;
}

export interface TrainRouteTouchpoint {
  accessibility: TrainRouteStationAccessibility;
  arrivalTime: string | null;
  departureTime: string | null;
  facilities: TrainRouteFacility[] | null;
  kind: 'ORIGIN' | 'TRANSFER' | 'DESTINATION';
  station: TrainRouteStation | null;
  stationName: string;
  departureStop: StopLocation | null;
  arrivalStop: StopLocation | null;
  walkingApproach: WalkingApproach | null;
}

export interface TrainRouteResponse {
  accessibilitySummary: TrainRouteAccessibilitySummary;
  arrivalTime: string;
  departureTime: string;
  destination: string;
  localizedDistanceText: string;
  localizedDurationText: string;
  origin: string;
  touchpoints?: TrainRouteTouchpoint[];
  transits: TrainRouteTransit[];
}

export interface TrainRouteSearchResponse {
  trips: TrainRouteResponse[];
}
