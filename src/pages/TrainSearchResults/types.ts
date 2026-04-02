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

export interface TrainRouteResponse {
  arrivalTime: string;
  departureTime: string;
  destination: string;
  localizedDistanceText: string;
  localizedDurationText: string;
  origin: string;
  transits: TrainRouteTransit[];
}
