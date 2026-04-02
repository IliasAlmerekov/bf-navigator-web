import { Link } from '@tanstack/react-router';
import {
  ChevronRight,
  Building2,
  Home,
  Info,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Satellite,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_SAVED_TRIPS } from '../../constants/savedTrips';
import type { SavedTrip } from '../../types/savedTrip';
import { getStoredSavedTrips, storeSavedTrips } from '../../utils/savedTripsStorage';
import styles from './SavedTrips.module.css';

type PinnedFavorite = {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
};

type RouteVisualMeta = {
  destinationSubtitle: string;
  originSubtitle: string;
  severity: 'normal' | 'critical';
};

const PINNED_FAVORITES: PinnedFavorite[] = [
  {
    id: 'berlin-hbf-home',
    title: 'Berlin Hbf',
    subtitle: 'Heimatbahnhof',
    icon: Home,
  },
  {
    id: 'frankfurt-office',
    title: 'Tagliches Buro',
    subtitle: 'Buroalltag',
    icon: Building2,
  },
];

const ROUTE_VISUALS: Record<string, RouteVisualMeta> = {
  'frankfurt-main-berlin-hbf': {
    destinationSubtitle: 'Berlin Hauptbahnhof',
    originSubtitle: 'Hbf Zentralstation',
    severity: 'normal',
  },
  'paris-london': {
    destinationSubtitle: 'St. Pancras Intl',
    originSubtitle: 'Gare du Nord',
    severity: 'normal',
  },
  'zuerich-milan': {
    destinationSubtitle: 'Milano Centrale',
    originSubtitle: 'Zurich HB',
    severity: 'critical',
  },
};

function getRouteVisual(trip: SavedTrip): RouteVisualMeta {
  return (
    ROUTE_VISUALS[trip.id] ?? {
      destinationSubtitle: trip.destination,
      originSubtitle: trip.origin,
      severity: 'normal',
    }
  );
}

function formatReliability(trip: SavedTrip) {
  if (trip.reliabilityPercent <= 0) {
    return trip.reliabilityLabel;
  }

  return `${trip.reliabilityPercent}% ${trip.reliabilityLabel}`;
}

function normalizeTripForGerman(trip: SavedTrip): SavedTrip {
  const checkedAtMap: Record<string, string> = {
    'checked just now': 'Gerade eben gepruft',
    'checked 2m ago': 'Vor 2 Min. gepruft',
    'checked 15m ago': 'Vor 15 Min. gepruft',
    'checked 1h ago': 'Vor 1 Std. gepruft',
  };

  const nextCheckedAtLabel =
    checkedAtMap[trip.checkedAtLabel.trim().toLowerCase()] ?? trip.checkedAtLabel;
  const nextReliabilityLabel =
    trip.reliabilityLabel.trim().toLowerCase() === 'accessibility'
      ? 'Zuverlassigkeit'
      : trip.reliabilityLabel;
  const nextDestination = trip.destination === 'Berlin Hauptbahnhof' ? 'Berlin' : trip.destination;

  return {
    ...trip,
    checkedAtLabel: nextCheckedAtLabel,
    destination: nextDestination,
    reliabilityLabel: nextReliabilityLabel,
  };
}

export default function SavedTrips() {
  const [savedTrips] = useState<SavedTrip[]>(() => {
    const storedTrips = getStoredSavedTrips();
    const localizedStoredTrips = storedTrips.map(normalizeTripForGerman);

    return localizedStoredTrips.length > 0 ? localizedStoredTrips : DEFAULT_SAVED_TRIPS;
  });

  useEffect(() => {
    const storedTrips = getStoredSavedTrips();

    if (storedTrips.length === 0) {
      storeSavedTrips(DEFAULT_SAVED_TRIPS);
      return;
    }

    storeSavedTrips(storedTrips.map(normalizeTripForGerman));
  }, []);

  const sortedTrips = useMemo(
    () => [...savedTrips].sort((a, b) => b.sortTimestamp - a.sortTimestamp),
    [savedTrips]
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Gespeicherte Reisen</h1>
          <p className={styles.subtitle}>
            Greife auf deine haufig genutzten Strecken und gepinnten Bahnhofe mit Echtzeitdaten zur
            Barrierefreiheit zu.
          </p>
        </div>
      </header>

      <div className={styles.layout}>
        <section aria-labelledby="letzte-routen-heading" className={styles['routes-column']}>
          <header className={styles['section-head']}>
            <h2 id="letzte-routen-heading">Letzte Routen</h2>
            <p className={styles['network-status']}>
              <span aria-hidden="true" className={styles['network-dot']} />
              Live-Netzwerkstatus: Optimal
            </p>
          </header>

          <ul className={styles['trips-list']}>
            {sortedTrips.map((trip) => {
              const routeVisual = getRouteVisual(trip);

              return (
                <li key={trip.id}>
                  <article
                    aria-labelledby={`saved-trip-${trip.id}`}
                    className={styles['trip-card']}
                    data-severity={routeVisual.severity}
                  >
                    <div aria-hidden="true" className={styles['trip-accent']} />

                    <div className={styles['trip-body']}>
                      <div className={styles['trip-meta']}>
                        <span className={styles['meta-badge']}>{trip.checkedAtLabel}</span>
                        <span className={styles['meta-badge']}>
                          {trip.reliabilityTone === 'excellent' ? (
                            <ShieldCheck
                              aria-hidden="true"
                              className={styles['reliability-icon']}
                            />
                          ) : (
                            <ShieldAlert
                              aria-hidden="true"
                              className={styles['reliability-icon']}
                            />
                          )}
                          {formatReliability(trip)}
                        </span>
                      </div>

                      <div className={styles['trip-main']}>
                        <div className={styles['trip-route']}>
                          <h3 id={`saved-trip-${trip.id}`}>
                            {trip.origin} <span aria-hidden="true">&rarr;</span> {trip.destination}
                          </h3>
                          <p>
                            <span>{routeVisual.originSubtitle}</span>
                            <span>{routeVisual.destinationSubtitle}</span>
                          </p>
                        </div>

                        <div className={styles['trip-actions']}>
                          <Link
                            aria-label={`Route von ${trip.origin} nach ${trip.destination} anzeigen`}
                            className={styles['view-route-link']}
                            to="/route-overview"
                          >
                            Route ansehen
                          </Link>
                          <span className={styles['trip-details']}>Reisedetails</span>
                        </div>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>

        <aside aria-label="Zusatzinformationen" className={styles['sidebar-column']}>
          <section aria-labelledby="favoriten-heading" className={styles.panel}>
            <h2 id="favoriten-heading" className={styles['panel-title']}>
              Gepinnte Favoriten
            </h2>

            <ul className={styles.favorites}>
              {PINNED_FAVORITES.map((favorite) => {
                const Icon = favorite.icon;

                return (
                  <li key={favorite.id}>
                    <Link className={styles['favorite-link']} to="/station-accessibility">
                      <div className={styles['favorite-main']}>
                        <span className={styles['favorite-name']}>{favorite.title}</span>
                        <span className={styles['favorite-sub']}>{favorite.subtitle}</span>
                      </div>
                      <span aria-hidden="true" className={styles['favorite-end']}>
                        <Icon className={styles['favorite-icon']} />
                        <ChevronRight className={styles['favorite-arrow']} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <button className={styles['pin-button']} type="button">
              <Plus aria-hidden="true" />
              Neuen Bahnhof pinnen
            </button>
          </section>

          <section className={styles['precision-card']}>
            <Satellite aria-hidden="true" className={styles['precision-icon']} />
            <h2>Echtzeit-Prazision</h2>
            <p>
              Unsere Daten-Engine aktualisiert Satelliten- und Gleisinformationen alle 30 Sekunden,
              damit du die genauesten Ankunfts- und Bahnsteigdaten in ganz Europa erhaltst.
            </p>
            <span>Live-Engine aktiv</span>
          </section>

          <section className={styles.notice}>
            <Info aria-hidden="true" className={styles['notice-icon']} />
            <div>
              <h2>Stufenfreier Zugang</h2>
              <p>
                Alle gespeicherten Routen spiegeln nur Bahnhofe mit verifizierter Aufzugs- und
                Rampenverfugbarkeit wider.
              </p>
            </div>
          </section>
        </aside>
      </div>

      <footer className={styles.footer}>
        <div className={styles['footer-brand']}>
          <strong>Trans-Europe Line</strong>
          <span>&copy; 2026 Trans-Europe Line. Der ruhige Reisebegleiter.</span>
        </div>

        <nav aria-label="Rechtliches" className={styles['footer-links']}>
          <Link to="/settings">Datenschutz</Link>
          <Link to="/settings">Nutzungsbedingungen</Link>
          <Link to="/settings">Barrierefreiheit</Link>
          <Link to="/settings">Cookie-Einstellungen</Link>
        </nav>
      </footer>
    </main>
  );
}
