import { Link, useRouterState } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import styles from './AppLayout.module.css';

type NavItem = {
  key: 'home' | 'saved' | 'alerts' | 'profile';
  label: string;
  to: '/' | '/saved-trips' | '/alerts' | '/profile';
};

const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'Home Search', to: '/' },
  { key: 'saved', label: 'Saved Trips', to: '/saved-trips' },
  { key: 'alerts', label: 'Alerts', to: '/alerts' },
  { key: 'profile', label: 'Profile', to: '/profile' },
];

const HOME_SECTION_PATHS = new Set([
  '/',
  '/route-overview',
  '/route-details',
  '/alternative-routes',
  '/station-accessibility',
  '/live-navigation',
]);

const PROFILE_SECTION_PATHS = new Set(['/profile', '/settings']);

function getActiveSection(pathname: string): NavItem['key'] {
  if (HOME_SECTION_PATHS.has(pathname)) {
    return 'home';
  }

  if (pathname === '/saved-trips') {
    return 'saved';
  }

  if (pathname === '/alerts') {
    return 'alerts';
  }

  if (PROFILE_SECTION_PATHS.has(pathname)) {
    return 'profile';
  }

  return 'home';
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const activeSection = getActiveSection(pathname);

  return (
    <div className={styles.shell}>
      <header className={styles['top-nav']}>
        <Link className={styles.brand} to="/">
          Barrier-Free Navigator
        </Link>
        <nav aria-label="Primary" className={styles['top-nav-links']}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              className={styles['nav-link']}
              data-active={item.key === activeSection}
              to={item.to}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className={styles.content}>{children}</div>

      <nav aria-label="Bottom navigation" className={styles['bottom-nav']}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.key}
            className={styles['bottom-nav-link']}
            data-active={item.key === activeSection}
            to={item.to}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
