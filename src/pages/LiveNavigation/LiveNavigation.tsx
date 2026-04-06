import { type JSX, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { Link } from '@tanstack/react-router';
import {
  Accessibility,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  HelpCircle,
  MapPin,
  Navigation,
  TriangleAlert,
  X,
} from 'lucide-react';
import {
  LIVE_NAVIGATION_DESTINATION,
  LIVE_NAVIGATION_MANUAL_STARTS,
  LIVE_NAVIGATION_ROUTE_POINTS,
  type LiveNavigationLatLng,
} from './liveNavigationData';
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

type RouteOverviewBackLinkProps = {
  'aria-label'?: string;
  children: JSX.Element;
  className?: string;
  to: '/route-overview';
};

type RouteStop = {
  id: string;
  isCurrent: boolean;
  kind: 'arrival' | 'departure' | 'transfer';
  platform: string;
  station: string;
  time: string;
};

const DEFAULT_MANUAL_START_ID = 'main-entrance';

const ROUTE_STOPS: RouteStop[] = [
  {
    id: 'frankfurt',
    station: 'Frankfurt (Main) Hbf',
    time: '08:42',
    platform: 'Gleis 7',
    kind: 'departure',
    isCurrent: true,
  },
  {
    id: 'kassel',
    station: 'Kassel-Wilhelmshöhe',
    time: '10:09',
    platform: 'Gleis 3',
    kind: 'transfer',
    isCurrent: false,
  },
  {
    id: 'berlin',
    station: 'Berlin Hbf',
    time: '12:54',
    platform: 'Gleis 11',
    kind: 'arrival',
    isCurrent: false,
  },
];

const RouteOverviewBackLink = Link as unknown as (props: RouteOverviewBackLinkProps) => JSX.Element;

function toLatLng(position: GeolocationPosition): LiveNavigationLatLng {
  return [position.coords.latitude, position.coords.longitude];
}

function getStatusTone(state: GeolocationState) {
  if (
    state === 'location-denied' ||
    state === 'location-unavailable' ||
    state === 'tracking-error'
  ) {
    return 'warning';
  }

  if (state === 'manual-start-selected') {
    return 'neutral';
  }

  return 'success';
}

function getStatusMessage(state: GeolocationState) {
  if (state === 'requesting-location') {
    return 'Standort wird ermittelt.';
  }

  if (state === 'location-denied') {
    return 'Standortfreigabe wurde abgelehnt. Bitte wählen Sie einen manuellen Startpunkt.';
  }

  if (state === 'location-unavailable') {
    return 'Geolokalisierung ist in diesem Browser nicht verfügbar. Bitte wählen Sie einen manuellen Startpunkt.';
  }

  if (state === 'tracking-error') {
    return 'Der Live-Standort konnte nicht aktualisiert werden. Bitte wählen Sie einen manuellen Startpunkt.';
  }

  if (state === 'manual-start-selected') {
    return 'Manueller Startpunkt aktiv.';
  }

  return 'Live-Standort wird aktualisiert.';
}

export default function LiveNavigation() {
  const geolocation = typeof navigator !== 'undefined' ? navigator.geolocation : undefined;
  const hasGeolocationSupport =
    typeof geolocation?.watchPosition === 'function' &&
    typeof geolocation.clearWatch === 'function';
  const [alternativeVisible, setAlternativeVisible] = useState(false);
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
    : (activeRoute[0]?.position ?? LIVE_NAVIGATION_DESTINATION.position);
  const hasActiveRoute = activeRoute.length > 0;
  const routeInstruction = buildInstructionState({
    destination: LIVE_NAVIGATION_DESTINATION,
    position: activePosition,
    routePoints: activeRoute,
  });
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
  const instructionDetail = hasActiveRoute
    ? `${routeInstruction.destinationLabel} · ca. ${routeInstruction.remainingDistanceMeters} m`
    : 'Bitte wählen Sie einen anderen Startpunkt.';
  const instructionHint = isAwaitingLiveLocation
    ? 'Bitte warten Sie, bis Ihr Standort bestimmt wurde.'
    : `Startpunkt: ${shouldUseLivePosition ? 'Aktueller Standort' : selectedManualStartLabel}`;
  const statusTone = getStatusTone(geolocationState);
  const statusMessage = getStatusMessage(geolocationState);

  function handleManualStartChange(startId: string) {
    setManualStartId(startId);
    setLivePosition(null);
    setGeolocationState('manual-start-selected');
  }

  function handleGoBack() {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <RouteOverviewBackLink
          aria-label="Zurück zur Routenübersicht"
          className={styles['header-back']}
          to="/route-overview"
        >
          <ArrowLeft aria-hidden="true" className={styles['header-back-icon']} />
        </RouteOverviewBackLink>

        <div className={styles['header-title-wrap']}>
          <p className={styles['header-train']}>ICE 782</p>
          <p className={styles['header-route']}>Frankfurt → Berlin</p>
        </div>

        <button
          aria-label="Hilfe und Barrierefreiheitsinformationen öffnen"
          className={styles['header-help']}
          type="button"
        >
          <HelpCircle aria-hidden="true" className={styles['header-help-icon']} />
        </button>
      </header>

      <div className={styles.layout}>
        <div className={styles['main-col']}>
          <section
            aria-live="polite"
            className={styles['status-banner']}
            data-tone={statusTone}
            role="status"
          >
            {statusTone === 'warning' ? (
              <TriangleAlert aria-hidden="true" className={styles['status-banner-icon']} />
            ) : statusTone === 'neutral' ? (
              <Navigation aria-hidden="true" className={styles['status-banner-icon']} />
            ) : (
              <CheckCircle2 aria-hidden="true" className={styles['status-banner-icon']} />
            )}
            <span className={styles['status-banner-text']}>{statusMessage}</span>
          </section>

          <section aria-labelledby="instruction-heading" className={styles['instruction-card']}>
            <div className={styles['instruction-pulse-ring']} aria-hidden="true" />
            <p className={styles['instruction-kicker']}>Nächster Schritt</p>
            <h1 className={styles['instruction-heading']} id="instruction-heading">
              {isAwaitingLiveLocation
                ? 'Standort wird ermittelt'
                : hasActiveRoute
                  ? routeInstruction.currentStepDescription
                  : 'Keine Navigationsschritte verfügbar'}
            </h1>
            <p className={styles['instruction-detail']}>
              <MapPin aria-hidden="true" className={styles['instruction-detail-icon']} />
              {instructionDetail}
            </p>
            <p className={styles['instruction-meta']}>{instructionHint}</p>
          </section>

          <section
            aria-label={`Karte – Weg zu ${LIVE_NAVIGATION_DESTINATION.label}`}
            className={styles['schematic-card']}
          >
            <div className={styles['schematic-header']}>
              <p className={styles['schematic-kicker']}>Live-Karte</p>
              <p className={styles['schematic-subtitle']}>
                Frankfurt (Main) Hbf · Weg zu {LIVE_NAVIGATION_DESTINATION.label}
              </p>
            </div>
            {shouldRenderMap ? (
              <LiveNavigationMap
                currentPosition={activePosition}
                destinationLabel={LIVE_NAVIGATION_DESTINATION.label}
                destinationPosition={LIVE_NAVIGATION_DESTINATION.position}
                nextLabel={routeInstruction.nextLabel}
                routePath={routeInstruction.routePoints.map((point) => point.position)}
              />
            ) : (
              <p className={styles['schematic-empty-state']}>
                {isAwaitingLiveLocation
                  ? 'Die Karte wird angezeigt, sobald Ihr Standort verfügbar ist.'
                  : 'Die Karte kann ohne verfügbare Routendaten nicht angezeigt werden.'}
              </p>
            )}
            <p className={styles['schematic-legend']}>
              Gelb gestrichelt: Leitpfad · Grün: nächster Orientierungspunkt · Rot: Ziel
            </p>
          </section>

          <div className={styles['alt-section']}>
            <button
              aria-expanded={alternativeVisible}
              className={styles['alt-toggle']}
              type="button"
              onClick={() => setAlternativeVisible((currentValue) => !currentValue)}
            >
              <TriangleAlert aria-hidden="true" className={styles['alt-toggle-icon']} />
              <span className={styles['alt-toggle-label']}>Alternativweg: Südrampe</span>
              <span className={styles['alt-toggle-duration']}>+3 Min.</span>
              <ChevronRight
                aria-hidden="true"
                className={styles['alt-toggle-chevron']}
                data-open={alternativeVisible}
              />
            </button>
            {alternativeVisible ? (
              <div
                aria-label="Alternativweg Details"
                className={styles['alt-detail']}
                role="region"
              >
                <p className={styles['alt-detail-text']}>
                  Über Südrampe (Ebene 0 → Ebene 1) und Gang B zum Ziel. Gesamtdistanz ca. 220 m.
                </p>
              </div>
            ) : null}
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
          <section aria-labelledby="countdown-heading" className={styles['countdown-card']}>
            <p className={styles['countdown-kicker']}>Abfahrt</p>
            <div className={styles['countdown-row']}>
              <span className={styles['countdown-value']}>4</span>
              <span className={styles['countdown-unit']}>Min.</span>
            </div>
            <p className={styles['countdown-train']} id="countdown-heading">
              ICE 782 · Gleis 7
            </p>
            <div className={styles['countdown-meta']}>
              <Clock aria-hidden="true" className={styles['countdown-meta-icon']} />
              <span>Pünktlich · Ab 08:42</span>
            </div>
          </section>

          <section aria-labelledby="journey-heading" className={styles['journey-card']}>
            <div className={styles['journey-header']}>
              <p className={styles['journey-kicker']}>Reiseverlauf</p>
              <h2 className={styles['journey-heading']} id="journey-heading">
                Frankfurt → Berlin
              </h2>
            </div>

            <ol aria-label="Haltestellen" className={styles.timeline} role="list">
              {ROUTE_STOPS.map((stop, index) => (
                <li
                  key={stop.id}
                  aria-current={stop.isCurrent ? 'step' : undefined}
                  className={styles['timeline-item']}
                  data-current={stop.isCurrent}
                  data-kind={stop.kind}
                >
                  <div className={styles['timeline-rail']}>
                    <div className={styles['timeline-dot']} />
                    {index < ROUTE_STOPS.length - 1 ? (
                      <div className={styles['timeline-line']} />
                    ) : null}
                  </div>
                  <div className={styles['timeline-content']}>
                    <div className={styles['timeline-row']}>
                      <div className={styles['timeline-left']}>
                        <p className={styles['timeline-station']}>{stop.station}</p>
                        <p className={styles['timeline-platform']}>{stop.platform}</p>
                      </div>
                      <p className={styles['timeline-time']}>{stop.time}</p>
                    </div>
                    {stop.isCurrent ? (
                      <span className={styles['timeline-current-badge']}>
                        <Navigation
                          aria-hidden="true"
                          className={styles['timeline-current-icon']}
                        />
                        Aktueller Standort
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <div className={styles.actions}>
            <button className={styles['action-btn']} data-variant="secondary" type="button">
              <Accessibility aria-hidden="true" className={styles['action-btn-icon']} />
              Hilfe anfordern
            </button>
            <button
              className={styles['action-btn']}
              data-variant="ghost"
              type="button"
              onClick={handleGoBack}
            >
              <X aria-hidden="true" className={styles['action-btn-icon']} />
              Navigation beenden
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
