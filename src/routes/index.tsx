import { createFileRoute } from '@tanstack/react-router';
import HomeSearch from '../pages/HomeSearch';

export const Route = createFileRoute('/')({
  component: HomeSearch,
});
