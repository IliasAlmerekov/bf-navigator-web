import { createFileRoute } from '@tanstack/react-router';
import TrainSearchResults from '../pages/TrainSearchResults';

type TrainSearchRouteSearch = {
  originEva: string;
  originName: string;
  destinationEva: string;
  destinationName: string;
  date: string;
  time: string;
};

const DEFAULT_SEARCH: TrainSearchRouteSearch = {
  date: '',
  destinationEva: '',
  destinationName: 'Berlin Hbf',
  originEva: '',
  originName: 'Hamburg Hbf',
  time: '',
};

function readSearchValue(
  search: Record<string, unknown>,
  key: keyof TrainSearchRouteSearch
): string {
  const value = search[key];

  return typeof value === 'string' ? value : DEFAULT_SEARCH[key];
}

export const Route = createFileRoute('/train-search-results')({
  validateSearch: (search): TrainSearchRouteSearch => ({
    date: readSearchValue(search, 'date'),
    destinationEva: readSearchValue(search, 'destinationEva'),
    destinationName: readSearchValue(search, 'destinationName'),
    originEva: readSearchValue(search, 'originEva'),
    originName: readSearchValue(search, 'originName'),
    time: readSearchValue(search, 'time'),
  }),
  component: TrainSearchResults,
});
