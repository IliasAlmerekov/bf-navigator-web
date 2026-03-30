import type { FilterOption } from './types';

export const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'Alle' },
  { key: 'fastest', label: 'Schnellste' },
  { key: 'fewest-transfers', label: 'Wenigste Umstiege' },
  { key: 'accessible', label: 'Barrierefrei' },
  { key: 'step-free', label: 'Nur Stufenfrei' },
  { key: 'ice-only', label: 'Nur ICE' },
];
