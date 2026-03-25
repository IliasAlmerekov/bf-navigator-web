import { Link, useRouterState } from '@tanstack/react-router';
import { CircleUserRound, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import alertsIcon from '../../assets/mobile-layout/alert.png';
import homeIcon from '../../assets/mobile-layout/home.png';
import profileIcon from '../../assets/mobile-layout/profile.png';
import savedIcon from '../../assets/mobile-layout/saved.png';
import styles from './AppLayout.module.css';

type NavItem = {
  key: 'home' | 'saved' | 'alerts' | 'profile';
  icon: string;
  label: string;
  to: '/' | '/saved-trips' | '/alerts' | '/profile';
};

const NAV_ITEMS: NavItem[] = [
  { key: 'home', icon: homeIcon, label: 'Home Search', to: '/' },
  { key: 'saved', icon: savedIcon, label: 'Saved Trips', to: '/saved-trips' },
  { key: 'alerts', icon: alertsIcon, label: 'Alerts', to: '/alerts' },
  { key: 'profile', icon: profileIcon, label: 'Profile', to: '/profile' },
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
          BF-NAVIGATOR
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
        <div className={styles['top-nav-actions']}>
          <button aria-label="Search" className={styles['top-nav-button']} type="button">
            <Search aria-hidden="true" />
          </button>
          <button aria-label="Profile" className={styles['top-nav-button']} type="button">
            <CircleUserRound aria-hidden="true" />
          </button>
        </div>
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
            <img alt="" className={styles['bottom-nav-icon']} src={item.icon} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
