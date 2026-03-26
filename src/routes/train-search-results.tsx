import { createFileRoute } from '@tanstack/react-router';
import TrainSearchResults from '../pages/TrainSearchResults';

export const Route = createFileRoute('/train-search-results')({
  component: TrainSearchResults,
});
