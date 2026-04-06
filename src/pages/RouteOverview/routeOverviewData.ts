import { Accessibility, Footprints, Wifi } from 'lucide-react';
import type {
  TrainRouteFacility,
  TrainRouteResponse,
  TrainRouteTouchpoint,
} from '../TrainSearchResults/types';
import type { SavedTrip, SavedTripReliabilityTone } from '../../types/savedTrip';
import { toLeafletPosition } from './mapData';
import type {
  ElevatorStatus,
  LiveEquipmentStatusCard,
  RouteHeroData,
  RouteMapLatLng,
  RouteMapMarker,
  RouteStationServicesPanel,
  TimelineAmenity,
  TimelineItem,
} from './types';

const BACKEND_TIMESTAMP_FALLBACK = 'Live-Zeitstempel nicht verfügbar';

function formatRouteTime(value: string | null | undefined) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getTransferMinutes(arrivalTime: string | null, departureTime: string | null) {
  if (!arrivalTime || !departureTime) {
    return null;
  }

  const arrival = new Date(arrivalTime);
  const departure = new Date(departureTime);

  if (Number.isNaN(arrival.getTime()) || Number.isNaN(departure.getTime())) {
    return null;
  }

  const diffMinutes = Math.round((departure.getTime() - arrival.getTime()) / 60000);

  return diffMinutes > 0 ? diffMinutes : null;
}

function buildTouchpointAmenities(touchpoint: TrainRouteTouchpoint) {
  const amenities: TimelineAmenity[] = [];

  if (touchpoint.station?.hasWiFi) {
    amenities.push({ icon: Wifi, label: 'WiFi' });
  }

  if (touchpoint.accessibility.stepFreeAvailable) {
    amenities.push({ icon: Footprints, label: 'Stufenfrei' });
  }

  if (touchpoint.accessibility.mobilityServiceAvailable) {
    amenities.push({ icon: Accessibility, label: 'Mobilitätsservice' });
  }

  return amenities;
}

function buildTimelinePlatformInfo(touchpoint: TrainRouteTouchpoint) {
  if (touchpoint.kind === 'ORIGIN') {
    return `Abfahrt ${formatRouteTime(touchpoint.departureTime)}`;
  }

  if (touchpoint.kind === 'DESTINATION') {
    return `Ankunft ${formatRouteTime(touchpoint.arrivalTime)}`;
  }

  return `Ankunft ${formatRouteTime(touchpoint.arrivalTime)} · Weiterfahrt ${formatRouteTime(
    touchpoint.departureTime
  )}`;
}

function buildTimelineLabel(kind: TrainRouteTouchpoint['kind']) {
  if (kind === 'ORIGIN') {
    return 'ABFAHRT';
  }

  if (kind === 'DESTINATION') {
    return 'ANKUNFT';
  }

  return 'UMSTIEG';
}

function buildTransferTrainLabel(route: TrainRouteResponse, touchpointIndex: number) {
  const nextTransit = route.transits[touchpointIndex];

  return nextTransit ? `Weiter mit ${nextTransit.trainName}` : undefined;
}

function mapServiceStatus(activeUnits: number, inactiveUnits: number) {
  if (inactiveUnits > 0 && activeUnits === 0) {
    return 'unavailable';
  }

  if (inactiveUnits > 0) {
    return 'limited';
  }

  return 'available';
}

function mapPanelStatus(
  activeUnits: number,
  inactiveUnits: number,
  status: string
): ElevatorStatus {
  if (inactiveUnits > 0 && activeUnits === 0) {
    return 'out_of_service';
  }

  if (inactiveUnits > 0 || status === 'LIMITED') {
    return 'limited';
  }

  return 'available';
}

function getFacilityDescriptionSummary(activeUnits: number, inactiveUnits: number) {
  if (activeUnits > 0 && inactiveUnits > 0) {
    return `${activeUnits} in Betrieb · ${inactiveUnits} außer Betrieb`;
  }

  if (inactiveUnits > 0) {
    return `${inactiveUnits} außer Betrieb`;
  }

  return `${activeUnits} in Betrieb`;
}

function buildAccessibilityDescription(touchpoint: TrainRouteTouchpoint) {
  const summaryParts: string[] = [];

  if (touchpoint.accessibility.status === 'UNKNOWN') {
    summaryParts.push('Keine Daten zur Barrierefreiheit verfügbar');
  } else {
    summaryParts.push(
      touchpoint.accessibility.stepFreeAvailable
        ? 'Stufenfreier Zugang verfügbar'
        : 'Kein bestätigter stufenfreier Zugang'
    );

    summaryParts.push(
      touchpoint.accessibility.mobilityServiceAvailable
        ? 'Mobilitätsservice verfügbar'
        : 'Mobilitätsservice nicht bestätigt'
    );
  }

  if (!touchpoint.accessibility.hasFacilityData) {
    summaryParts.push('Keine Live-Anlagendaten verfügbar');
  } else {
    const activeUnits =
      touchpoint.accessibility.activeElevators + touchpoint.accessibility.activeEscalators;
    const inactiveUnits =
      touchpoint.accessibility.inactiveElevators + touchpoint.accessibility.inactiveEscalators;

    if (activeUnits + inactiveUnits === 0) {
      summaryParts.push('Keine gelisteten Aufzüge oder Rolltreppen');
    } else {
      summaryParts.push(`${activeUnits} in Betrieb · ${inactiveUnits} außer Betrieb`);
    }
  }

  return summaryParts.join(' · ');
}

function buildEquipmentCard(
  id: LiveEquipmentStatusCard['id'],
  title: string,
  activeUnits: number,
  inactiveUnits: number
) {
  const totalUnits = activeUnits + inactiveUnits;

  if (totalUnits === 0) {
    return null;
  }

  return {
    availableUnits: activeUnits,
    id,
    outOfServiceUnits: inactiveUnits,
    status: mapServiceStatus(activeUnits, inactiveUnits),
    summary: getFacilityDescriptionSummary(activeUnits, inactiveUnits),
    title,
    totalUnits,
  } satisfies LiveEquipmentStatusCard;
}

function getRelevantStationServicesTouchpoint(touchpoints: TrainRouteTouchpoint[]) {
  const degradedTouchpoint = touchpoints.find(
    (touchpoint) =>
      touchpoint.accessibility.inactiveElevators > 0 ||
      touchpoint.accessibility.inactiveEscalators > 0 ||
      touchpoint.accessibility.status !== 'ACCESSIBLE'
  );

  if (degradedTouchpoint) {
    return degradedTouchpoint;
  }

  const facilityTouchpoint = touchpoints.find(
    (touchpoint) =>
      (touchpoint.facilities?.length ?? 0) > 0 || touchpoint.accessibility.hasFacilityData
  );

  if (facilityTouchpoint) {
    return facilityTouchpoint;
  }

  return touchpoints[touchpoints.length - 1] ?? null;
}

function serializePosition([latitude, longitude]: RouteMapLatLng) {
  return `${latitude}:${longitude}`;
}

function dedupePositions(positions: Array<RouteMapLatLng | null>) {
  const seenPositions = new Set<string>();

  return positions.filter((position): position is RouteMapLatLng => {
    if (!position) {
      return false;
    }

    const key = serializePosition(position);

    if (seenPositions.has(key)) {
      return false;
    }

    seenPositions.add(key);
    return true;
  });
}

function getTouchpointPosition(touchpoint: TrainRouteTouchpoint): RouteMapLatLng | null {
  return (
    (touchpoint.facilities ?? [])
      .map((facility) => toLeafletPosition(facility.geocoordX, facility.geocoordY))
      .find((position): position is RouteMapLatLng => position !== null) ?? null
  );
}

function getTouchpointMarkerKind(kind: TrainRouteTouchpoint['kind']): RouteMapMarker['kind'] {
  if (kind === 'ORIGIN') {
    return 'origin';
  }

  if (kind === 'DESTINATION') {
    return 'destination';
  }

  return 'transfer';
}

function getTouchpointMarkerDescription(kind: TrainRouteTouchpoint['kind']) {
  if (kind === 'ORIGIN') {
    return 'Startbahnhof';
  }

  if (kind === 'DESTINATION') {
    return 'Zielbahnhof';
  }

  return 'Umstiegsbahnhof';
}

export function mapTrainRouteToRouteHero(route: TrainRouteResponse): RouteHeroData {
  const transfers = Math.max(route.transits.length - 1, 0);

  return {
    arrival: {
      label: 'Ankunft',
      station: route.destination,
      time: formatRouteTime(route.arrivalTime),
    },
    confidence: '',
    departure: {
      label: 'Abfahrt',
      station: route.origin,
      time: formatRouteTime(route.departureTime),
    },
    duration: route.localizedDurationText,
    eyebrow: '',
    title: '',
    transfers:
      transfers === 0 ? 'Direktverbindung' : `${transfers} Umstieg${transfers > 1 ? 'e' : ''}`,
  };
}

export function mapTrainRouteToTimeline(route: TrainRouteResponse): TimelineItem[] {
  if (!route.touchpoints || route.touchpoints.length === 0) {
    return [];
  }

  return route.touchpoints.map((touchpoint, index) => {
    const transferMinutes = getTransferMinutes(touchpoint.arrivalTime, touchpoint.departureTime);

    return {
      amenities: buildTouchpointAmenities(touchpoint),
      kind:
        touchpoint.kind === 'ORIGIN'
          ? 'departure'
          : touchpoint.kind === 'DESTINATION'
            ? 'arrival'
            : 'transfer',
      label: buildTimelineLabel(touchpoint.kind),
      platformInfo: buildTimelinePlatformInfo(touchpoint),
      station: touchpoint.stationName,
      time: formatRouteTime(touchpoint.departureTime ?? touchpoint.arrivalTime),
      transferNote: transferMinutes ? `${transferMinutes} MIN. UMSTIEG` : undefined,
      transferTrain:
        touchpoint.kind === 'TRANSFER' ? buildTransferTrainLabel(route, index) : undefined,
    };
  });
}

export function mapTrainRouteToStationServicesPanel(route: TrainRouteResponse) {
  if (!route.touchpoints || route.touchpoints.length === 0) {
    return null;
  }

  const touchpoint = getRelevantStationServicesTouchpoint(route.touchpoints);

  if (!touchpoint) {
    return null;
  }

  const availableUnits =
    touchpoint.accessibility.activeElevators + touchpoint.accessibility.activeEscalators;
  const outOfServiceUnits =
    touchpoint.accessibility.inactiveElevators + touchpoint.accessibility.inactiveEscalators;

  const liveEquipmentCards = [
    buildEquipmentCard(
      'elevators',
      'Aufzüge',
      touchpoint.accessibility.activeElevators,
      touchpoint.accessibility.inactiveElevators
    ),
    buildEquipmentCard(
      'escalators',
      'Rolltreppen',
      touchpoint.accessibility.activeEscalators,
      touchpoint.accessibility.inactiveEscalators
    ),
  ].filter((card): card is LiveEquipmentStatusCard => card !== null);

  return {
    elevatorCard: {
      availableUnits,
      description: buildAccessibilityDescription(touchpoint),
      outOfServiceUnits,
      status: mapPanelStatus(availableUnits, outOfServiceUnits, touchpoint.accessibility.status),
      title: 'Bahnhofsbarrierefreiheit',
      totalUnits: availableUnits + outOfServiceUnits,
    },
    lastUpdated: BACKEND_TIMESTAMP_FALLBACK,
    liveEquipmentCards,
    stationId:
      touchpoint.station?.evaNumber?.toString() ??
      slugify(`${route.origin}-${touchpoint.stationName}`),
    stationName: touchpoint.stationName,
  } satisfies RouteStationServicesPanel;
}

export function getRouteOverviewFacilities(route: TrainRouteResponse) {
  if (!route.touchpoints) {
    return [];
  }

  const seenEquipmentNumbers = new Set<number>();
  const facilities: TrainRouteFacility[] = [];

  route.touchpoints.forEach((touchpoint) => {
    (touchpoint.facilities ?? []).forEach((facility) => {
      if (seenEquipmentNumbers.has(facility.equipmentnumber)) {
        return;
      }

      seenEquipmentNumbers.add(facility.equipmentnumber);
      facilities.push(facility);
    });
  });

  return facilities;
}

export function getRouteOverviewMapPath(route: TrainRouteResponse) {
  const touchpointPath = dedupePositions((route.touchpoints ?? []).map(getTouchpointPosition));

  if (touchpointPath.length >= 2) {
    return touchpointPath;
  }

  return dedupePositions(
    getRouteOverviewFacilities(route).map((facility) =>
      toLeafletPosition(facility.geocoordX, facility.geocoordY)
    )
  );
}

export function getRouteOverviewMapLabels(route: TrainRouteResponse) {
  const transferTouchpoint = route.touchpoints?.find(
    (touchpoint) => touchpoint.kind === 'TRANSFER'
  );

  return {
    ariaLabel: `Routenvorschau von ${route.origin} nach ${route.destination}`,
    destinationLabel: route.destination,
    originLabel: route.origin,
    transferLabel: transferTouchpoint?.stationName,
  };
}

export function getRouteOverviewMapStopMarkers(route: TrainRouteResponse) {
  const stopMarkers: Array<RouteMapMarker | null> = (route.touchpoints ?? []).map(
    (touchpoint, index) => {
      const position = getTouchpointPosition(touchpoint);

      if (!position) {
        return null;
      }

      return {
        description: getTouchpointMarkerDescription(touchpoint.kind),
        id:
          touchpoint.station?.evaNumber !== undefined
            ? `route-${touchpoint.kind.toLowerCase()}-${touchpoint.station.evaNumber}`
            : `route-${touchpoint.kind.toLowerCase()}-${slugify(`${touchpoint.stationName}-${index}`)}`,
        kind: getTouchpointMarkerKind(touchpoint.kind),
        label: touchpoint.stationName,
        position,
        status: 'default',
      } satisfies RouteMapMarker;
    }
  );

  return stopMarkers.filter((marker): marker is RouteMapMarker => marker !== null);
}

function buildSelectedTripId(route: TrainRouteResponse) {
  return slugify(`${route.origin}-${route.destination}-${route.departureTime}`);
}

function getSavedTripTone(route: TrainRouteResponse): SavedTripReliabilityTone {
  return route.accessibilitySummary.status === 'ACCESSIBLE' ? 'excellent' : 'warning';
}

function getSavedTripPercent(route: TrainRouteResponse) {
  if (route.accessibilitySummary.totalStations === 0) {
    return 0;
  }

  return Math.round(
    (route.accessibilitySummary.stepFreeStations / route.accessibilitySummary.totalStations) * 100
  );
}

export function buildSavedTripFromRoute(route: TrainRouteResponse, now = Date.now()): SavedTrip {
  return {
    checkedAtLabel: 'gerade geprüft',
    destination: route.destination,
    id: buildSelectedTripId(route),
    origin: route.origin,
    reliabilityLabel: 'Barrierefreiheit',
    reliabilityPercent: getSavedTripPercent(route),
    reliabilityTone: getSavedTripTone(route),
    sortTimestamp: now,
  };
}
