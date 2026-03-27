import { useEffect, useState } from 'react';
import OnboardingMobile from './Onboarding';
import OnboardingDesktop from '../OnboardingDesktop/OnboardingDesktop';

const DESKTOP_BREAKPOINT_QUERY = '(min-width: 1024px)';

function getDesktopMatch() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia(DESKTOP_BREAKPOINT_QUERY).matches;
}

export default function OnboardingAdaptive() {
  const [isDesktop, setIsDesktop] = useState<boolean>(getDesktopMatch);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia(DESKTOP_BREAKPOINT_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  if (isDesktop) {
    return <OnboardingDesktop />;
  }

  return <OnboardingMobile />;
}
