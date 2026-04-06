import { createFileRoute } from '@tanstack/react-router';
import {
  ACCESSIBILITY_PREFERENCES,
  type AccessibilityPreferenceId,
} from '../constants/accessibilityPreferences';
import RouteOverview from '../pages/RouteOverview';

type RouteOverviewSearch = {
  accessibilityPreference: AccessibilityPreferenceId | '';
  originEva: string;
  originName: string;
  destinationEva: string;
  destinationName: string;
  date: string;
  time: string;
};

const DEFAULT_SEARCH: RouteOverviewSearch = {
  accessibilityPreference: '',
  date: '',
  destinationEva: '',
  destinationName: '',
  originEva: '',
  originName: '',
  time: '',
};

const accessibilityPreferenceIds = new Set<string>(
  ACCESSIBILITY_PREFERENCES.map((preference) => preference.id)
);

function readSearchValue(search: Record<string, unknown>, key: keyof RouteOverviewSearch): string {
  const value = search[key];

  return typeof value === 'string' ? value : DEFAULT_SEARCH[key];
}

function readAccessibilityPreference(
  search: Record<string, unknown>
): RouteOverviewSearch['accessibilityPreference'] {
  const value = search.accessibilityPreference;

  if (typeof value !== 'string' || value === '') {
    return DEFAULT_SEARCH.accessibilityPreference;
  }

  return accessibilityPreferenceIds.has(value) ? (value as AccessibilityPreferenceId) : '';
}

export const Route = createFileRoute('/route-overview')({
  validateSearch: (search): RouteOverviewSearch => ({
    accessibilityPreference: readAccessibilityPreference(search),
    date: readSearchValue(search, 'date'),
    destinationEva: readSearchValue(search, 'destinationEva'),
    destinationName: readSearchValue(search, 'destinationName'),
    originEva: readSearchValue(search, 'originEva'),
    originName: readSearchValue(search, 'originName'),
    time: readSearchValue(search, 'time'),
  }),
  component: RouteOverview,
});
