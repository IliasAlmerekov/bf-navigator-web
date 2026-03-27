export type TrainStatus = 'ontime' | 'delayed' | 'cancelled';
export type CrowdLevel = 'low' | 'moderate' | 'high';
export type FilterKey =
  | 'all'
  | 'fastest'
  | 'fewest-transfers'
  | 'accessible'
  | 'step-free'
  | 'ice-only';

export interface TrainResult {
  id: string;
  trainType: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  transfers: number;
  status: TrainStatus;
  delayMinutes?: number;
  isAccessible: boolean;
  accessibilityNote?: string;
  crowdLevel: CrowdLevel;
  price: string;
  platform?: string;
}

export interface FilterOption {
  key: FilterKey;
  label: string;
}
