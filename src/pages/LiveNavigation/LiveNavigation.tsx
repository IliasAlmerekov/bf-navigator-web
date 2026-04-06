import { type JSX, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { Link } from '@tanstack/react-router';
import {
  LIVE_NAVIGATION_DESTINATION,
  LIVE_NAVIGATION_MANUAL_STARTS,
  LIVE_NAVIGATION_ROUTE_POINTS,
  type LiveNavigationLatLng,
} from './liveNavigationData';
import { NavigationInstructions } from './components/NavigationInstructions';
import { ManualStartSelector } from './components/ManualStartSelector';
import { LiveNavigationMap } from './components/LiveNavigationMap';
import { buildInstructionState, getRoutePointsFromManualStart } from './liveNavigationUtils';
import styles from './LiveNavigation.module.css';

type GeolocationState =
  | 'requesting-location'
  | 'live-tracking'
  | 'location-denied'
  | 'location-unavailable'
  | 'tracking-error'
  | 'manual-start-selected';

const DEFAULT_MANUAL_START_ID = 'main-entrance';

type RouteOverviewBackLinkProps = {
  children: string;
  className?: string;
  to: '/route-overview';
  'aria-label'?: string;
};

const RouteOverviewBackLink = Link as unknown as (props: RouteOverviewBackLinkProps) => JSX.Element;

function toLatLng(position: GeolocationPosition): LiveNavigationLatLng {
  return [position.coords.latitude, position.coords.longitude];
}

export default function LiveNavigation() {
  const geolocation = typeof navigator !== 'undefined' ? navigator.geolocation : undefined;
  const hasGeolocationSupport =
    typeof geolocation?.watchPosition === 'function' &&
    typeof geolocation.clearWatch === 'function';
  const [geolocationState, setGeolocationState] = useState<GeolocationState>(
    hasGeolocationSupport ? 'requesting-location' : 'location-unavailable'
  );
  const [livePosition, setLivePosition] = useState<LiveNavigationLatLng | null>(null);
  const [manualStartId, setManualStartId] = useState<string | null>(
    hasGeolocationSupport ? null : DEFAULT_MANUAL_START_ID
  );

  useEffect(() => {
    if (!hasGeolocationSupport) {
      return;
    }

    const watchId = geolocation.watchPosition(
      (position) => {
        flushSync(() => {
          setLivePosition(toLatLng(position));
          setGeolocationState('live-tracking');
        });
      },
      (error) => {
        flushSync(() => {
          setGeolocationState(error.code === 1 ? 'location-denied' : 'tracking-error');
          setLivePosition(null);
          setManualStartId(DEFAULT_MANUAL_START_ID);
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000,
      }
    );

    return () => {
      geolocation.clearWatch(watchId);
    };
  }, [geolocation, hasGeolocationSupport]);

  const fallbackRoute = getRoutePointsFromManualStart(
    manualStartId ?? DEFAULT_MANUAL_START_ID,
    LIVE_NAVIGATION_MANUAL_STARTS,
    LIVE_NAVIGATION_ROUTE_POINTS
  );
  const isAwaitingLiveLocation =
    geolocationState === 'requesting-location' && manualStartId === null;
  const shouldUseLivePosition = geolocationState === 'live-tracking' && livePosition !== null;
  const activeRoute = shouldUseLivePosition ? LIVE_NAVIGATION_ROUTE_POINTS : fallbackRoute;
  const activePosition = shouldUseLivePosition
    ? livePosition
    : activeRoute[0]?.position ?? LIVE_NAVIGATION_DESTINATION.position;
  const hasActiveRoute = activeRoute.length > 0;
  const routeInstruction = buildInstructionState({
    destination: LIVE_NAVIGATION_DESTINATION,
    position: activePosition,
    routePoints: activeRoute,
  });

  function handleManualStartChange(startId: string) {
    setManualStartId(startId);
    setLivePosition(null);
    setGeolocationState('manual-start-selected');
  }

  function getStatusMessage() {
    if (geolocationState === 'requesting-location') {
      return 'Standort wird ermittelt.';
    }

    if (geolocationState === 'location-denied') {
      return 'Standortfreigabe wurde abgelehnt. Bitte wählen Sie einen manuellen Startpunkt.';
    }

    if (geolocationState === 'location-unavailable') {
      return 'Geolokalisierung ist in diesem Browser nicht verfügbar. Bitte wählen Sie einen manuellen Startpunkt.';
    }

    if (geolocationState === 'tracking-error') {
      return 'Der Live-Standort konnte nicht aktualisiert werden. Bitte wählen Sie einen manuellen Startpunkt.';
    }

    if (geolocationState === 'manual-start-selected') {
      return 'Manueller Startpunkt aktiv.';
    }

    return 'Live-Standort wird aktualisiert.';
  }

  const shouldShowManualFallback =
    geolocationState === 'location-denied' ||
    geolocationState === 'location-unavailable' ||
    geolocationState === 'tracking-error' ||
    geolocationState === 'manual-start-selected';
  const selectedManualStartLabel =
    LIVE_NAVIGATION_MANUAL_STARTS.find(
      (start) => start.id === (manualStartId ?? DEFAULT_MANUAL_START_ID)
    )?.label ?? 'Haupteingang';
  const shouldRenderMap = !isAwaitingLiveLocation && hasActiveRoute;
  const instructionStartLabel = shouldUseLivePosition
    ? 'Aktueller Standort'
    : selectedManualStartLabel;
  const instructionCurrentLabel = routeInstruction.currentLabel;

  function renderDynamicGuidance() {
    if (isAwaitingLiveLocation) {
      return (
        <section aria-labelledby="live-navigation-heading">
          <p>Live Navigation</p>
          <h1 id="live-navigation-heading">
            Live Navigation zu {LIVE_NAVIGATION_DESTINATION.label}
          </h1>
          <p>Startpunkt: Automatische Standortbestimmung</p>
          <p>Aktueller Orientierungspunkt: Standort wird ermittelt</p>
          <p>Bitte warten Sie, bis Ihr Standort bestimmt wurde.</p>
          <p>Die nächsten Hinweise werden automatisch eingeblendet.</p>
        </section>
      );
    }

    if (!hasActiveRoute) {
      return (
        <section aria-labelledby="live-navigation-heading">
          <p>Live Navigation</p>
          <h1 id="live-navigation-heading">
            Live Navigation zu {LIVE_NAVIGATION_DESTINATION.label}
          </h1>
          <p>Startpunkt: {instructionStartLabel}</p>
          <p>Für diesen Startpunkt sind derzeit keine Navigationsschritte verfügbar.</p>
          <p>Bitte wählen Sie einen anderen Startpunkt.</p>
        </section>
      );
    }

    return (
      <NavigationInstructions
        currentLabel={instructionCurrentLabel}
        currentStepDescription={routeInstruction.currentStepDescription}
        destinationLabel={routeInstruction.destinationLabel}
        nextLabel={routeInstruction.nextLabel}
        remainingDistanceMeters={routeInstruction.remainingDistanceMeters}
        startLabel={instructionStartLabel}
      />
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <RouteOverviewBackLink
          aria-label="Zurück zur Routenübersicht"
          className={styles['header-back']}
          to="/route-overview"
        >
          Zurück
        </RouteOverviewBackLink>
      </header>

      <section aria-live="polite" className={styles['status-banner']} role="status">
        <p className={styles['status-banner-text']}>{getStatusMessage()}</p>
      </section>

      <div className={styles.layout}>
        <div className={styles['main-col']}>
          <div aria-atomic="true" aria-live="polite">
            {renderDynamicGuidance()}
          </div>

          {shouldShowManualFallback ? (
            <ManualStartSelector
              options={LIVE_NAVIGATION_MANUAL_STARTS}
              selectedStartId={manualStartId}
              onChange={handleManualStartChange}
            />
          ) : null}
        </div>

        <aside className={styles['panel-col']}>
          <section
            aria-labelledby="live-navigation-map-heading"
            className={styles['schematic-card']}
          >
            <h2 id="live-navigation-map-heading" className={styles['schematic-subtitle']}>
              Live-Karte
            </h2>
            {shouldRenderMap ? (
              <LiveNavigationMap
                currentPosition={activePosition}
                destinationLabel={LIVE_NAVIGATION_DESTINATION.label}
                destinationPosition={LIVE_NAVIGATION_DESTINATION.position}
                routePath={routeInstruction.routePoints.map((point) => point.position)}
              />
            ) : (
              <p>
                {isAwaitingLiveLocation
                  ? 'Die Karte wird angezeigt, sobald Ihr Standort verfügbar ist.'
                  : 'Die Karte kann ohne verfügbare Routendaten nicht angezeigt werden.'}
              </p>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
