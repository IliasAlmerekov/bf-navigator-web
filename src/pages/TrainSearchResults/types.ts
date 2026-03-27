export type FilterKey =
  | 'all'
  | 'fastest'
  | 'fewest-transfers'
  | 'accessible'
  | 'step-free'
  | 'ice-only';

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

export interface FilterOption {
  key: FilterKey;
  label: string;
}
