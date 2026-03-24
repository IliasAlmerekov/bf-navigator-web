import { createFileRoute } from '@tanstack/react-router';
import SavedTrips from '../pages/SavedTrips';

export const Route = createFileRoute('/saved-trips')({
  component: SavedTrips,
});
