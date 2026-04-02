export type SavedTripReliabilityTone = 'excellent' | 'warning';

export type SavedTrip = {
  id: string;
  origin: string;
  destination: string;
  checkedAtLabel: string;
  reliabilityPercent: number;
  reliabilityLabel: string;
  reliabilityTone: SavedTripReliabilityTone;
  sortTimestamp: number;
};
