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

// ── Legacy timetable type (current API) ──────────────────────────────────────
export interface TimetableEntry {
  trainNumber: string;
  trainType: string;
  departureTime: string;
  arrivalTime: string | null;
  line: string | null;
  departurePlatform: string | null;
  arrivalPlatform: string | null;
  route: string[];
}

// ── Google Routes API types ──────────────────────────────────────────────────
export interface RoutesApiResponse {
  routes: RouteResult[];
  geocodingResults?: {
    origin?: GeocodingResult;
    destination?: GeocodingResult;
  };
}

export interface GeocodingResult {
  geocoderStatus?: Record<string, unknown>;
  type?: string[];
  placeId?: string;
}

export interface RouteResult {
  legs: RouteLeg[];
  distanceMeters: number;
  duration: string;
  staticDuration: string;
  localizedValues: RouteLocalizedValues;
  routeLabels?: string[];
}

export interface RouteLocalizedValues {
  distance: LocalizedText;
  duration: LocalizedText;
  staticDuration: LocalizedText;
  transitFare?: Record<string, unknown>;
}

export interface LocalizedText {
  text: string;
}

export interface RouteLeg {
  steps: RouteStep[];
  distanceMeters: number;
  duration: string;
  staticDuration: string;
  localizedValues: LegLocalizedValues;
  stepsOverview?: StepsOverview;
}

export interface LegLocalizedValues {
  distance: LocalizedText;
  duration: LocalizedText;
  staticDuration: LocalizedText;
}

export interface StepsOverview {
  multiModalSegments: MultiModalSegment[];
}

export interface MultiModalSegment {
  stepStartIndex: number;
  stepEndIndex: number;
  navigationInstruction?: NavigationInstruction;
  travelMode: TravelMode;
}

export type TravelMode = 'WALK' | 'TRANSIT';

export interface RouteStep {
  distanceMeters: number;
  staticDuration: string;
  travelMode: TravelMode;
  polyline?: { encodedPolyline: string };
  startLocation?: LatLngWrapper;
  endLocation?: LatLngWrapper;
  navigationInstruction?: NavigationInstruction;
  localizedValues: StepLocalizedValues;
  transitDetails?: TransitDetails;
}

export interface LatLngWrapper {
  latLng: { latitude: number; longitude: number };
}

export interface NavigationInstruction {
  maneuver?: string;
  instructions?: string;
}

export interface StepLocalizedValues {
  distance: LocalizedText;
  staticDuration: LocalizedText;
}

export interface TransitDetails {
  stopDetails: TransitStopDetails;
  localizedValues: TransitLocalizedValues;
  headsign: string;
  transitLine: TransitLine;
  stopCount: number;
}

export interface TransitStopDetails {
  arrivalStop: TransitStop;
  departureStop: TransitStop;
  arrivalTime: string;
  departureTime: string;
}

export interface TransitStop {
  name: string;
  location?: LatLngWrapper;
}

export interface TransitLocalizedValues {
  arrivalTime: TransitTimeValue;
  departureTime: TransitTimeValue;
}

export interface TransitTimeValue {
  time: { text: string };
  timeZone: string;
}

export interface TransitLine {
  agencies: TransitAgency[];
  name?: string;
  nameShort?: string;
  color?: string;
  textColor?: string;
  vehicle: TransitVehicle;
}

export interface TransitAgency {
  name: string;
  uri?: string;
  phoneNumber?: string;
}

export interface TransitVehicle {
  name: { text: string };
  type: string;
  iconUri?: string;
  localIconUri?: string;
}
