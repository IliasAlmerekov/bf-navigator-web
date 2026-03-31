import { createFileRoute, redirect } from '@tanstack/react-router';
import HomeSearch from '../pages/HomeSearch';
import { hasCompletedOnboarding } from '../utils/accountStorage';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    if (!hasCompletedOnboarding()) {
      throw redirect({ to: '/onboarding' });
    }
  },
  component: HomeSearch,
});
