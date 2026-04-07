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
  type LiveNavigationManualStart,
  type LiveNavigationRoutePoint,
} from './liveNavigationData';
import { ManualStartSelector } from './components/ManualStartSelector';
import { LiveNavigationMap } from './components/LiveNavigationMap';
import { buildInstructionState, getRoutePointsFromManualStart } from './liveNavigationUtils';
import type { TrainRouteFacility, TrainRouteTouchpoint } from '../TrainSearchResults/types';
import { getSelectedTrainRoute } from '../../utils/selectedTrainRouteStorage';
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

const FALLBACK_MAP_ORIGIN_LABEL = 'Frankfurt (Main) Hbf';

const RouteOverviewBackLink = Link as unknown as (props: RouteOverviewBackLinkProps) => JSX.Element;

function toLatLng(position: GeolocationPosition): LiveNavigationLatLng {
  return [position.coords.latitude, position.coords.longitude];
}

function isValidCoordinate(value: number | null): value is number {
  return value !== null && Number.isFinite(value);
}

function hasValidCoordinates(
  facility: TrainRouteFacility
): facility is TrainRouteFacility & { geocoordX: number; geocoordY: number } {
  return isValidCoordinate(facility.geocoordX) && isValidCoordinate(facility.geocoordY);
}

function getStopPosition(
  stop: TrainRouteTouchpoint['departureStop'] | TrainRouteTouchpoint['arrivalStop']
): LiveNavigationLatLng | null {
  if (stop?.latitude == null || stop?.longitude == null) {
    return null;
  }

  return [stop.latitude, stop.longitude];
}

function getTouchpointPosition(touchpoint: TrainRouteTouchpoint): LiveNavigationLatLng | null {
  const departurePosition = getStopPosition(touchpoint.departureStop);
  if (departurePosition) {
    return departurePosition;
  }

  const arrivalPosition = getStopPosition(touchpoint.arrivalStop);
  if (arrivalPosition) {
    return arrivalPosition;
  }

  const facilityWithCoordinates = (touchpoint.facilities ?? []).find(hasValidCoordinates);
  if (!facilityWithCoordinates) {
    return null;
  }

  return [facilityWithCoordinates.geocoordY, facilityWithCoordinates.geocoordX];
}

function getActiveElevatorPoints(
  touchpoint: TrainRouteTouchpoint,
  index: number
): LiveNavigationRoutePoint[] {
  return (touchpoint.facilities ?? [])
    .filter(
      (f): f is TrainRouteFacility & { geocoordX: number; geocoordY: number } =>
        f.type === 'ELEVATOR' && f.state === 'ACTIVE' && hasValidCoordinates(f)
    )
    .map((f, elevatorIndex) => ({
      description: f.description,
      id: `elevator-${index}-${elevatorIndex}`,
      instruction: `Nehmen Sie ${f.description} zur Plattform.`,
      label: f.description,
      position: [f.geocoordY, f.geocoordX] as LiveNavigationLatLng,
    }));
}

function getRoutePointsFromTouchpoints(
  touchpoints: TrainRouteTouchpoint[] | undefined
): LiveNavigationRoutePoint[] {
  if (!touchpoints?.length) {
    return [];
  }

  const points: LiveNavigationRoutePoint[] = [];

  for (const [index, touchpoint] of touchpoints.entries()) {
    if (touchpoint.kind !== 'DESTINATION' && touchpoint.walkingApproach != null) {
      points.push({
        description: `Eingang ${touchpoint.stationName}.`,
        id: `entrance-${index}`,
        instruction:
          touchpoint.walkingApproach.instruction ??
          `Betreten Sie ${touchpoint.stationName} am Eingang.`,
        label: `Eingang ${touchpoint.stationName}`,
        position: [touchpoint.walkingApproach.latitude, touchpoint.walkingApproach.longitude],
      });
    }

    points.push(...getActiveElevatorPoints(touchpoint, index));

    const position = getTouchpointPosition(touchpoint);
    if (position == null) {
      continue;
    }

    points.push({
      description: `Orientierungspunkt: ${touchpoint.stationName}.`,
      id: `${touchpoint.kind.toLowerCase()}-${index}`,
      instruction:
        touchpoint.kind === 'DESTINATION'
          ? `Sie haben ${touchpoint.stationName} erreicht.`
          : `Folgen Sie dem Leitweg in Richtung ${touchpoint.stationName}.`,
      label: touchpoint.stationName,
      position,
    });
  }

  return points;
}

type InactiveElevatorWarning = {
  description: string;
  operationalResumeDate: string | null;
  stationName: string;
};

function getInactiveElevatorWarnings(
  touchpoints: TrainRouteTouchpoint[] | undefined
): InactiveElevatorWarning[] {
  if (!touchpoints?.length) {
    return [];
  }

  const warnings: InactiveElevatorWarning[] = [];

  for (const touchpoint of touchpoints) {
    for (const facility of touchpoint.facilities ?? []) {
      if (facility.type === 'ELEVATOR' && facility.state === 'INACTIVE') {
        warnings.push({
          description: facility.description,
          operationalResumeDate: facility.operationalResumeDate,
          stationName: touchpoint.stationName,
        });
      }
    }
  }

  return warnings;
}

function getManualStartsFromRoutePoints(
  routePoints: LiveNavigationRoutePoint[]
): LiveNavigationManualStart[] {
  if (routePoints.length < 2) {
    return [];
  }

  return routePoints.slice(0, -1).map((point) => ({
    description: `Starten Sie bei ${point.label}.`,
    id: point.id,
    label: point.label,
    routePointId: point.id,
  }));
}

function getRequiredManualStarts(): LiveNavigationManualStart[] {
  return [
    {
      description: 'Starten Sie am Haupteingang und folgen Sie dem Leitweg zum Abfahrtsgleis.',
      id: 'main-entrance',
      label: 'Haupteingang',
      routePointId: 'main-entrance',
    },
    {
      description: 'Starten Sie an der Info-Station und folgen Sie dem Leitweg zum Abfahrtsgleis.',
      id: 'info-point',
      label: 'Info-Station',
      routePointId: 'info-point',
    },
  ];
}

function mergeManualStartOptions(
  derivedManualStarts: LiveNavigationManualStart[]
): LiveNavigationManualStart[] {
  const requiredManualStarts = getRequiredManualStarts();
  const optionalDerivedStarts = derivedManualStarts.filter(
    (start) => !requiredManualStarts.some((requiredStart) => requiredStart.id === start.id)
  );

  return [...requiredManualStarts, ...optionalDerivedStarts];
}

function mergeManualFallbackRoutePoints(
  routePoints: LiveNavigationRoutePoint[]
): LiveNavigationRoutePoint[] {
  const requiredFallbackPoints = LIVE_NAVIGATION_ROUTE_POINTS.filter(
    (point) => point.id === 'main-entrance' || point.id === 'info-point'
  ).map((point) => ({
    ...point,
    instruction: 'Folgen Sie dem Leitweg zum Abfahrtsgleis.',
  }));
  const deduplicatedRoutePoints = routePoints.filter(
    (point) => !requiredFallbackPoints.some((requiredPoint) => requiredPoint.id === point.id)
  );

  return [...requiredFallbackPoints, ...deduplicatedRoutePoints];
}

function hasRouteAnchors(routePoints: LiveNavigationRoutePoint[]) {
  const hasOriginAnchor = routePoints.some((point) => point.id.startsWith('origin-'));
  const hasDestinationAnchor = routePoints.some((point) => point.id.startsWith('destination-'));

  return hasOriginAnchor && hasDestinationAnchor;
}

function getVisibleTrainLabel(trainNames: string[] | undefined): string {
  if (!trainNames?.length) {
    return 'ICE 782';
  }

  const uniqueTrainNames = trainNames
    .map((trainName) => trainName.trim())
    .filter(
      (trainName, index, names) => trainName.length > 0 && names.indexOf(trainName) === index
    );

  return uniqueTrainNames.length > 0 ? uniqueTrainNames.join(' · ') : 'ICE 782';
}

function formatRouteStopTime(value: string | null) {
  if (!value) {
    return '--:--';
  }

  const match = value.match(/T(\d{2}:\d{2})/);

  return match?.[1] ?? '--:--';
}

function mapTouchpointKindToRouteStopKind(kind: TrainRouteTouchpoint['kind']): RouteStop['kind'] {
  if (kind === 'ORIGIN') {
    return 'departure';
  }

  if (kind === 'DESTINATION') {
    return 'arrival';
  }

  return 'transfer';
}

function getRouteStopsFromTouchpoints(
  touchpoints: TrainRouteTouchpoint[] | undefined
): RouteStop[] {
  if (!touchpoints?.length) {
    return [];
  }

  return touchpoints.map((touchpoint, index) => {
    const time =
      touchpoint.kind === 'ORIGIN'
        ? formatRouteStopTime(touchpoint.departureTime)
        : formatRouteStopTime(touchpoint.arrivalTime ?? touchpoint.departureTime);

    return {
      id: `${touchpoint.kind.toLowerCase()}-stop-${index}`,
      isCurrent: index === 0,
      kind: mapTouchpointKindToRouteStopKind(touchpoint.kind),
      platform:
        touchpoint.kind === 'ORIGIN'
          ? 'Start'
          : touchpoint.kind === 'DESTINATION'
            ? 'Ziel'
            : 'Umstieg',
      station: touchpoint.stationName,
      time,
    };
  });
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
  const selectedRoute = getSelectedTrainRoute();
  const selectedTouchpoints = selectedRoute?.touchpoints;
  const hasSelectedRouteTouchpoints = Boolean(selectedTouchpoints?.length);
  const derivedRoutePoints = getRoutePointsFromTouchpoints(selectedTouchpoints);
  const hasCompleteDerivedRoutePoints = hasRouteAnchors(derivedRoutePoints);
  const routePoints = hasCompleteDerivedRoutePoints
    ? derivedRoutePoints
    : LIVE_NAVIGATION_ROUTE_POINTS;
  const manualFallbackRoutePoints = hasCompleteDerivedRoutePoints
    ? mergeManualFallbackRoutePoints(routePoints)
    : routePoints;
  const manualStartOptions = hasCompleteDerivedRoutePoints
    ? mergeManualStartOptions(getManualStartsFromRoutePoints(derivedRoutePoints))
    : LIVE_NAVIGATION_MANUAL_STARTS;
  const defaultManualStartId = manualStartOptions[0]?.id ?? DEFAULT_MANUAL_START_ID;
  const routeStops = hasSelectedRouteTouchpoints
    ? getRouteStopsFromTouchpoints(selectedTouchpoints)
    : ROUTE_STOPS;
  const inactiveElevatorWarnings = getInactiveElevatorWarnings(selectedTouchpoints);
  const selectedOriginLabel = hasSelectedRouteTouchpoints
    ? (selectedTouchpoints?.find((touchpoint) => touchpoint.kind === 'ORIGIN')?.stationName ??
      selectedRoute?.origin)
    : FALLBACK_MAP_ORIGIN_LABEL;
  const selectedDestinationLabel = hasSelectedRouteTouchpoints
    ? (selectedTouchpoints?.find((touchpoint) => touchpoint.kind === 'DESTINATION')?.stationName ??
      selectedRoute?.destination ??
      LIVE_NAVIGATION_DESTINATION.label)
    : LIVE_NAVIGATION_DESTINATION.label;
  const routeHeading = hasSelectedRouteTouchpoints
    ? `${selectedRoute?.origin} → ${selectedRoute?.destination}`
    : 'Frankfurt → Berlin';
  const trainLabel = getVisibleTrainLabel(
    selectedRoute?.transits.map((transit) => transit.trainName)
  );
  const selectedDestinationPosition = hasCompleteDerivedRoutePoints
    ? derivedRoutePoints[derivedRoutePoints.length - 1].position
    : LIVE_NAVIGATION_DESTINATION.position;
  const destination = {
    ...LIVE_NAVIGATION_DESTINATION,
    label: selectedDestinationLabel,
    position: selectedDestinationPosition,
  };
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
    hasGeolocationSupport ? null : defaultManualStartId
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
          setManualStartId(defaultManualStartId);
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
  }, [defaultManualStartId, geolocation, hasGeolocationSupport]);

  const fallbackRoute = getRoutePointsFromManualStart(
    manualStartId ?? defaultManualStartId,
    manualStartOptions,
    manualFallbackRoutePoints
  );
  const isAwaitingLiveLocation =
    geolocationState === 'requesting-location' && manualStartId === null;
  const shouldUseLivePosition = geolocationState === 'live-tracking' && livePosition !== null;
  const activeRoute = shouldUseLivePosition ? routePoints : fallbackRoute;
  const activePosition = shouldUseLivePosition
    ? livePosition
    : (activeRoute[0]?.position ?? destination.position);
  const hasActiveRoute = activeRoute.length > 0;
  const routeInstruction = buildInstructionState({
    destination,
    position: activePosition,
    routePoints: activeRoute,
  });
  const shouldShowManualFallback =
    geolocationState === 'location-denied' ||
    geolocationState === 'location-unavailable' ||
    geolocationState === 'tracking-error' ||
    geolocationState === 'manual-start-selected';
  const selectedManualStartLabel =
    manualStartOptions.find((start) => start.id === (manualStartId ?? defaultManualStartId))
      ?.label ?? 'Haupteingang';
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
          <p className={styles['header-train']}>{trainLabel}</p>
          <p className={styles['header-route']}>{routeHeading}</p>
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
            aria-label={`Karte – Weg zu ${destination.label}`}
            className={styles['schematic-card']}
          >
            <div className={styles['schematic-header']}>
              <p className={styles['schematic-kicker']}>Live-Karte</p>
              <p className={styles['schematic-subtitle']}>
                {selectedOriginLabel} · Weg zu {destination.label}
              </p>
            </div>
            {shouldRenderMap ? (
              <LiveNavigationMap
                currentPosition={activePosition}
                destinationLabel={destination.label}
                destinationPosition={destination.position}
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

          {inactiveElevatorWarnings.length > 0 ? (
            <section
              aria-label="Aufzug nicht verfügbar"
              className={styles['elevator-warning']}
              role="alert"
            >
              {inactiveElevatorWarnings.map((warning, idx) => (
                <div
                  key={`${warning.stationName}-${idx}`}
                  className={styles['elevator-warning-item']}
                >
                  <TriangleAlert aria-hidden="true" className={styles['elevator-warning-icon']} />
                  <div>
                    <p className={styles['elevator-warning-title']}>
                      Aufzug nicht verfügbar bei {warning.stationName}: {warning.description}
                    </p>
                    {warning.operationalResumeDate != null ? (
                      <p className={styles['elevator-warning-date']}>
                        Voraussichtliche Wiederinbetriebnahme: {warning.operationalResumeDate}
                      </p>
                    ) : null}
                    <p className={styles['elevator-warning-advice']}>
                      Bitte wenden Sie sich an das Bahnhofspersonal.
                    </p>
                  </div>
                </div>
              ))}
            </section>
          ) : null}

          {shouldShowManualFallback ? (
            <ManualStartSelector
              options={manualStartOptions}
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
              {trainLabel} · Gleis 7
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
                {routeHeading}
              </h2>
            </div>

            <ol aria-label="Haltestellen" className={styles.timeline} role="list">
              {routeStops.map((stop, index) => (
                <li
                  key={stop.id}
                  aria-current={stop.isCurrent ? 'step' : undefined}
                  className={styles['timeline-item']}
                  data-current={stop.isCurrent}
                  data-kind={stop.kind}
                >
                  <div className={styles['timeline-rail']}>
                    <div className={styles['timeline-dot']} />
                    {index < routeStops.length - 1 ? (
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
