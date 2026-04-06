import { Link, useRouterState } from '@tanstack/react-router';
import { Bell, Bookmark, ChevronDown, CircleUserRound, House, LifeBuoy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { getToken } from '../../utils/tokenStorage';
import { ExpandingSearchDock } from '../ui/ExpandingSearchDock';
import styles from './AppLayout.module.css';

type NavItem = {
  key: 'home' | 'saved' | 'alerts' | 'profile';
  icon: LucideIcon;
  label: string;
  to: '/' | '/saved-trips' | '/alerts' | '/profile';
};

const NAV_ITEMS: NavItem[] = [
  { key: 'home', icon: House, label: 'Startsuche', to: '/' },
  { key: 'saved', icon: Bookmark, label: 'Gespeicherte Reisen', to: '/saved-trips' },
  { key: 'alerts', icon: Bell, label: 'Meldungen', to: '/alerts' },
  { key: 'profile', icon: LifeBuoy, label: 'Hilfe', to: '/profile' },
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
const PROFILE_MENU_ITEMS = [
  { key: 'login', label: 'Login', to: '/login' },
  { key: 'registration', label: 'Registration', to: '/register' },
] as const;

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
  const isAuthenticated = getToken() !== null;
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const activeSection = getActiveSection(pathname);
  const profileMenuId = useId();
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideMenu = profileMenuRef.current?.contains(target) ?? false;
      const clickedOnButton = profileButtonRef.current?.contains(target) ?? false;

      if (!clickedInsideMenu && !clickedOnButton) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
        profileButtonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isProfileMenuOpen]);

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return;
    }

    requestAnimationFrame(() => {
      const firstItem = profileMenuRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
      firstItem?.focus();
    });
  }, [isProfileMenuOpen]);

  return (
    <div className={styles.shell}>
      <header className={styles['top-nav']}>
        <Link className={styles.brand} to="/">
          BF-NAVIGATOR
        </Link>
        <nav aria-label="Primaernavigation" className={styles['top-nav-links']}>
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
          <ExpandingSearchDock />
          <div className={styles['profile-menu-wrapper']}>
            {isAuthenticated ? (
              <Link aria-label="Profil" className={styles['top-nav-button']} to="/profile">
                <CircleUserRound aria-hidden="true" className={styles['top-nav-button-icon']} />
              </Link>
            ) : (
              <>
                <button
                  ref={profileButtonRef}
                  aria-controls={profileMenuId}
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="menu"
                  aria-label="Profilmenue oeffnen"
                  className={styles['top-nav-button']}
                  data-open={isProfileMenuOpen}
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen((open) => !open);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setIsProfileMenuOpen(true);
                    }
                  }}
                >
                  <CircleUserRound aria-hidden="true" className={styles['top-nav-button-icon']} />
                  <span className={styles['top-nav-button-label']}>Profil</span>
                  <ChevronDown aria-hidden="true" className={styles['top-nav-button-chevron']} />
                </button>

                {isProfileMenuOpen ? (
                  <div
                    id={profileMenuId}
                    ref={profileMenuRef}
                    aria-label="Profilaktionen"
                    className={styles['profile-menu']}
                    role="menu"
                    onKeyDown={(event) => {
                      const menuItems = Array.from(
                        profileMenuRef.current?.querySelectorAll<HTMLElement>(
                          '[role="menuitem"]'
                        ) ?? []
                      );
                      const currentIndex = menuItems.indexOf(document.activeElement as HTMLElement);

                      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                        event.preventDefault();
                        const nextIndex =
                          event.key === 'ArrowDown'
                            ? (currentIndex + 1 + menuItems.length) % menuItems.length
                            : (currentIndex - 1 + menuItems.length) % menuItems.length;
                        menuItems[nextIndex]?.focus();
                      }

                      if (event.key === 'Home') {
                        event.preventDefault();
                        menuItems[0]?.focus();
                      }

                      if (event.key === 'End') {
                        event.preventDefault();
                        menuItems[menuItems.length - 1]?.focus();
                      }
                    }}
                  >
                    {PROFILE_MENU_ITEMS.map((item) => (
                      <Link
                        key={item.key}
                        className={styles['profile-menu-item']}
                        data-active={pathname === item.to}
                        role="menuitem"
                        to={item.to}
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Escape') {
                            event.preventDefault();
                            setIsProfileMenuOpen(false);
                            profileButtonRef.current?.focus();
                          }
                        }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </header>

      <div className={styles.content}>{children}</div>

      <nav aria-label="Fussnavigation" className={styles['footer-nav']}>
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
