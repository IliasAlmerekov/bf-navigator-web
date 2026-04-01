import { createFileRoute } from '@tanstack/react-router';
import {
  ACCESSIBILITY_PREFERENCES,
  type AccessibilityPreferenceId,
} from '../constants/accessibilityPreferences';
import TrainSearchResults from '../pages/TrainSearchResults';

type TrainSearchRouteSearch = {
  accessibilityPreference: AccessibilityPreferenceId | '';
  originEva: string;
  originName: string;
  destinationEva: string;
  destinationName: string;
  date: string;
  time: string;
};

const DEFAULT_SEARCH: TrainSearchRouteSearch = {
  accessibilityPreference: '',
  date: '',
  destinationEva: '',
  destinationName: 'Berlin Hbf',
  originEva: '',
  originName: 'Hamburg Hbf',
  time: '',
};

const accessibilityPreferenceIds = new Set<string>(
  ACCESSIBILITY_PREFERENCES.map((preference) => preference.id)
);

function readSearchValue(
  search: Record<string, unknown>,
  key: keyof TrainSearchRouteSearch
): string {
  const value = search[key];

  return typeof value === 'string' ? value : DEFAULT_SEARCH[key];
}

function readAccessibilityPreference(
  search: Record<string, unknown>
): TrainSearchRouteSearch['accessibilityPreference'] {
  const value = search.accessibilityPreference;

  if (typeof value !== 'string' || value === '') {
    return DEFAULT_SEARCH.accessibilityPreference;
  }

  return accessibilityPreferenceIds.has(value) ? (value as AccessibilityPreferenceId) : '';
}

export const Route = createFileRoute('/train-search-results')({
  validateSearch: (search): TrainSearchRouteSearch => ({
    accessibilityPreference: readAccessibilityPreference(search),
    date: readSearchValue(search, 'date'),
    destinationEva: readSearchValue(search, 'destinationEva'),
    destinationName: readSearchValue(search, 'destinationName'),
    originEva: readSearchValue(search, 'originEva'),
    originName: readSearchValue(search, 'originName'),
    time: readSearchValue(search, 'time'),
  }),
  component: TrainSearchResults,
});
