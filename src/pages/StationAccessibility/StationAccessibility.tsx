import { useEffect, useState } from 'react';
import type {
  TrainRouteResponse,
  TrainRouteStationAccessibility,
  TrainRouteTouchpoint,
} from '../TrainSearchResults/types';
import { getSelectedTrainRoute } from '../../utils/selectedTrainRouteStorage';
import styles from './StationAccessibility.module.css';

type PageState =
  | { status: 'loading' }
  | { status: 'empty'; message: string }
  | { status: 'error' }
  | { route: TrainRouteResponse; status: 'ready'; touchpoints: TrainRouteTouchpoint[] };

function getTouchpointLabel(kind: TrainRouteTouchpoint['kind']) {
  if (kind === 'ORIGIN') {
    return 'Start';
  }

  if (kind === 'DESTINATION') {
    return 'Ziel';
  }

  return 'Umstieg';
}

function getAccessLabel(accessibility: TrainRouteStationAccessibility) {
  if (accessibility.status === 'UNKNOWN') {
    return 'Stufenfrei: keine Daten';
  }

  return accessibility.stepFreeAvailable ? 'Stufenfrei verfügbar' : 'Stufenfrei nicht bestätigt';
}

function getMobilityServiceLabel(accessibility: TrainRouteStationAccessibility) {
  if (accessibility.status === 'UNKNOWN') {
    return 'Mobilitätsservice: keine Daten';
  }

  return accessibility.mobilityServiceAvailable
    ? 'Mobilitätsservice verfügbar'
    : 'Mobilitätsservice nicht bestätigt';
}

function getFacilityLabel(
  facilityName: string,
  activeCount: number,
  inactiveCount: number,
  hasFacilityData: boolean
) {
  if (!hasFacilityData) {
    return `${facilityName}: Live-Anlagenstatus nicht verfügbar`;
  }

  const parts: string[] = [];

  if (activeCount > 0) {
    parts.push(`${activeCount} aktiv`);
  }

  if (inactiveCount > 0) {
    parts.push(`${inactiveCount} außer Betrieb`);
  }

  if (parts.length === 0) {
    return `${facilityName}: keine Daten`;
  }

  return `${facilityName}: ${parts.join(' · ')}`;
}

function hasPartialData(touchpoint: TrainRouteTouchpoint) {
  return !touchpoint.accessibility.hasFacilityData || touchpoint.station === null;
}

export default function StationAccessibility() {
  const [pageState, setPageState] = useState<PageState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) {
        return;
      }

      try {
        const selectedRoute = getSelectedTrainRoute();

        if (!selectedRoute) {
          setPageState({
            status: 'empty',
            message: 'Keine ausgewählte Reise verfügbar.',
          });
          return;
        }

        if (!selectedRoute.touchpoints || selectedRoute.touchpoints.length === 0) {
          setPageState({
            status: 'empty',
            message: 'Keine Bahnhofsdetails für diese Verbindung verfügbar.',
          });
          return;
        }

        setPageState({
          route: selectedRoute,
          status: 'ready',
          touchpoints: selectedRoute.touchpoints,
        });
      } catch {
        setPageState({ status: 'error' });
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (pageState.status === 'loading') {
    return (
      <main className={styles.page}>
        <p aria-live="polite" className={styles.message} role="status">
          Barrierefreiheitsdaten werden geladen.
        </p>
      </main>
    );
  }

  if (pageState.status === 'error') {
    return (
      <main className={styles.page}>
        <p className={styles.message} role="alert">
          Barrierefreiheitsdaten konnten nicht geladen werden. Bitte versuchen Sie es erneut.
        </p>
      </main>
    );
  }

  if (pageState.status === 'empty') {
    return (
      <main className={styles.page}>
        <p aria-live="polite" className={styles.message} role="status">
          {pageState.message}
        </p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>Selected trip accessibility</p>
        <h1 className={styles.title}>Station Accessibility</h1>
        <p className={styles.subtitle}>
          {pageState.route.origin} nach {pageState.route.destination}
        </p>
      </header>

      <ul aria-label="Bahnhofsübersicht" className={styles.list} role="list">
        {pageState.touchpoints.map((touchpoint, index) => {
          const partialData = hasPartialData(touchpoint);
          const headingId = `touchpoint-heading-${index}`;

          return (
            <li key={`${touchpoint.kind}-${touchpoint.stationName}-${index}`}>
              <article aria-labelledby={headingId} className={styles.card}>
                <div className={styles['card-header']}>
                  <div>
                    <p className={styles['touchpoint-kind']}>{getTouchpointLabel(touchpoint.kind)}</p>
                    <h2 className={styles['station-name']} id={headingId}>
                      {touchpoint.stationName}
                    </h2>
                  </div>
                  {partialData ? (
                    <span className={styles['partial-badge']}>Teildaten verfügbar</span>
                  ) : (
                    <span className={styles['status-badge']}>{touchpoint.accessibility.status}</span>
                  )}
                </div>

                <p className={styles.summary}>{touchpoint.accessibility.summary}</p>

                <ul className={styles['detail-list']} role="list">
                  <li className={styles['detail-item']}>{getAccessLabel(touchpoint.accessibility)}</li>
                  <li className={styles['detail-item']}>
                    {getMobilityServiceLabel(touchpoint.accessibility)}
                  </li>
                  <li className={styles['detail-item']}>
                    {getFacilityLabel(
                      'Aufzüge',
                      touchpoint.accessibility.activeElevators,
                      touchpoint.accessibility.inactiveElevators,
                      touchpoint.accessibility.hasFacilityData
                    )}
                  </li>
                  <li className={styles['detail-item']}>
                    {getFacilityLabel(
                      'Rolltreppen',
                      touchpoint.accessibility.activeEscalators,
                      touchpoint.accessibility.inactiveEscalators,
                      touchpoint.accessibility.hasFacilityData
                    )}
                  </li>
                </ul>
              </article>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
