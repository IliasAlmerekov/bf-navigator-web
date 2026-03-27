import { createFileRoute } from '@tanstack/react-router';
import OnboardingDesktop from '../pages/OnboardingDesktop/OnboardingDesktop';

export const Route = createFileRoute('/onboarding-desktop')({
  component: OnboardingDesktop,
});
