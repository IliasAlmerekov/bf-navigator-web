import { Link, useRouterState } from '@tanstack/react-router';
import { Bell, Bookmark, House, LifeBuoy, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import styles from './AppLayout.module.css';

type NavItem = {
  key: 'home' | 'saved' | 'alerts' | 'profile';
  icon: LucideIcon;
  label: string;
  to: '/' | '/saved-trips' | '/alerts' | '/profile';
};

const NAV_ITEMS: NavItem[] = [
  { key: 'home', icon: House, label: 'Home Search', to: '/' },
  { key: 'saved', icon: Bookmark, label: 'Saved Trips', to: '/saved-trips' },
  { key: 'alerts', icon: Bell, label: 'Alerts', to: '/alerts' },
  { key: 'profile', icon: LifeBuoy, label: 'Support', to: '/profile' },
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
              aria-current={item.key === activeSection ? 'page' : undefined}
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
          <button aria-label="Support" className={styles['top-nav-button']} type="button">
            <LifeBuoy aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className={styles.content}>{children}</div>

      <nav aria-label="Footer navigation" className={styles['footer-nav']}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              className={styles['footer-nav-link']}
              data-active={item.key === activeSection}
              aria-current={item.key === activeSection ? 'page' : undefined}
              to={item.to}
            >
              <Icon aria-hidden="true" className={styles['footer-nav-icon']} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
