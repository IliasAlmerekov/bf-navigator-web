import { createFileRoute } from '@tanstack/react-router';
import RouteDetails from '../pages/RouteDetails';

export const Route = createFileRoute('/route-details')({
  component: RouteDetails,
});
