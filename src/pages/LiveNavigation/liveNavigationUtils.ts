import type {
  LiveNavigationDestination,
  LiveNavigationLatLng,
  LiveNavigationManualStart,
  LiveNavigationRoutePoint,
} from './liveNavigationData';
import { LIVE_NAVIGATION_ROUTE_POINTS } from './liveNavigationData';
import type { TrainRouteFacility, TrainRouteTouchpoint } from '../TrainSearchResults/types';

type InstructionState = {
  currentLabel: string;
  currentStepDescription: string;
  destinationLabel: string;
  nextLabel: string;
  remainingDistanceMeters: number;
  routePoints: LiveNavigationRoutePoint[];
};

const STREET_SIDE_ENTRANCE_LABEL = 'Haupteingang (Straßenseite)';

const EARTH_RADIUS_METERS = 6371000;
function isValidLatitude(value: number) {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

function isValidLongitude(value: number) {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

export function isValidLatLngTuple(position: LiveNavigationLatLng) {
  const [latitude, longitude] = position;

  return isValidLatitude(latitude) && isValidLongitude(longitude);
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function getRouteSpecificEntranceLabel(
  walkingApproach: TrainRouteTouchpoint['walkingApproach'] | undefined
) {
  const instruction = walkingApproach?.instruction?.trim();

  if (!instruction) {
    return STREET_SIDE_ENTRANCE_LABEL;
  }

  const namedEntranceMatch = instruction.match(/^[^:]+:\s*(.+)$/u);
  const namedEntrance = namedEntranceMatch?.[1]?.trim().replace(/[.]+$/u, '');

  return namedEntrance && namedEntrance.length > 0 ? namedEntrance : STREET_SIDE_ENTRANCE_LABEL;
}

function getDistanceMeters(from: LiveNavigationLatLng, to: LiveNavigationLatLng) {
  const [fromLat, fromLng] = from;
  const [toLat, toLng] = to;
  const latitudeDelta = toRadians(toLat - fromLat);
  const longitudeDelta = toRadians(toLng - fromLng);
  const startLatitude = toRadians(fromLat);
  const endLatitude = toRadians(toLat);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function findNearestRoutePointIndex(
  position: LiveNavigationLatLng,
  routePoints: LiveNavigationRoutePoint[]
) {
  if (routePoints.length === 0) {
    return 0;
  }

  return routePoints.reduce((bestIndex, point, index) => {
    const bestDistance = getDistanceMeters(position, routePoints[bestIndex].position);
    const currentDistance = getDistanceMeters(position, point.position);

    return currentDistance < bestDistance ? index : bestIndex;
  }, 0);
}

export function calculateRemainingDistanceMeters(
  activeIndex: number,
  routePoints: LiveNavigationRoutePoint[]
) {
  if (activeIndex >= routePoints.length - 1) {
    return 0;
  }

  let distance = 0;

  for (let index = activeIndex; index < routePoints.length - 1; index += 1) {
    distance += getDistanceMeters(routePoints[index].position, routePoints[index + 1].position);
  }

  return Math.round(distance);
}

export function getRoutePointsFromManualStart(
  startId: string,
  manualStarts: LiveNavigationManualStart[],
  routePoints: LiveNavigationRoutePoint[]
) {
  const selectedStart = manualStarts.find((start) => start.id === startId);

  if (!selectedStart) {
    return routePoints;
  }

  const startIndex = routePoints.findIndex((point) => point.id === selectedStart.routePointId);

  return startIndex >= 0 ? routePoints.slice(startIndex) : routePoints;
}

export function buildInstructionState({
  destination,
  position,
  routePoints,
}: {
  destination: LiveNavigationDestination;
  position: LiveNavigationLatLng;
  routePoints: LiveNavigationRoutePoint[];
}): InstructionState {
  if (routePoints.length === 0) {
    return {
      currentLabel: '',
      currentStepDescription: '',
      destinationLabel: destination.label,
      nextLabel: destination.label,
      remainingDistanceMeters: 0,
      routePoints: [],
    };
  }

  const activeIndex = findNearestRoutePointIndex(position, routePoints);
  const activePoint = routePoints[activeIndex];
  const nextPoint = routePoints[Math.min(activeIndex + 1, routePoints.length - 1)];
  const remainingRoutePoints = routePoints.slice(activeIndex);

  return {
    currentLabel: activePoint.label,
    currentStepDescription: activePoint.instruction,
    destinationLabel: destination.label,
    nextLabel: nextPoint.label,
    remainingDistanceMeters: calculateRemainingDistanceMeters(activeIndex, routePoints),
    routePoints: remainingRoutePoints,
  };
}

export type LiveNavigationMapMarker = {
  accessibleLabel: string;
  id: string;
  kind: 'entrance' | 'active-elevator' | 'inactive-elevator' | 'escalator' | 'departure';
  label: string;
  position: LiveNavigationLatLng;
};

export type LiveNavigationOriginRouteModel = {
  hasAccessibleRoute: boolean;
  markers: LiveNavigationMapMarker[];
  routePoints: LiveNavigationRoutePoint[];
  warningMessage: string | null;
};

export function hasValidFacilityCoordinates(
  facility: TrainRouteFacility
): facility is TrainRouteFacility & { geocoordX: number; geocoordY: number } {
  if (facility.geocoordX == null || facility.geocoordY == null) {
    return false;
  }

  return isValidLatLngTuple([facility.geocoordY, facility.geocoordX]);
}

export function buildOriginRouteModel(
  touchpoints: TrainRouteTouchpoint[] | undefined
): LiveNavigationOriginRouteModel {
  const originTouchpoint = touchpoints?.find((touchpoint) => touchpoint.kind === 'ORIGIN');
  const fallbackEntrance = LIVE_NAVIGATION_ROUTE_POINTS[0];
  const fallbackElevator = LIVE_NAVIGATION_ROUTE_POINTS[1] ?? LIVE_NAVIGATION_ROUTE_POINTS[0];
  const fallbackDeparture =
    LIVE_NAVIGATION_ROUTE_POINTS[LIVE_NAVIGATION_ROUTE_POINTS.length - 1] ??
    LIVE_NAVIGATION_ROUTE_POINTS[0];

  if (!fallbackEntrance || !fallbackElevator || !fallbackDeparture) {
    return { hasAccessibleRoute: false, markers: [], routePoints: [], warningMessage: null };
  }

  const walkingApproachPosition: LiveNavigationLatLng | null = originTouchpoint?.walkingApproach
    ? [originTouchpoint.walkingApproach.latitude, originTouchpoint.walkingApproach.longitude]
    : null;
  const entrancePosition =
    walkingApproachPosition && isValidLatLngTuple(walkingApproachPosition)
      ? walkingApproachPosition
      : fallbackEntrance.position;
  const entranceLabel = getRouteSpecificEntranceLabel(originTouchpoint?.walkingApproach);
  const entranceDescription =
    entranceLabel === STREET_SIDE_ENTRANCE_LABEL
      ? 'Sie stehen am Haupteingang auf der Straßenseite.'
      : `Sie befinden sich bei ${entranceLabel}.`;

  const activeElevators = (originTouchpoint?.facilities ?? []).filter(
    (facility): facility is TrainRouteFacility & { geocoordX: number; geocoordY: number } =>
      facility.type === 'ELEVATOR' &&
      facility.state === 'ACTIVE' &&
      hasValidFacilityCoordinates(facility)
  );

  const nearestActiveElevator = activeElevators.reduce<
    (TrainRouteFacility & { geocoordX: number; geocoordY: number }) | null
  >((nearestFacility, facility) => {
    if (!nearestFacility) {
      return facility;
    }

    const currentDistance = getDistanceMeters(entrancePosition, [
      facility.geocoordY,
      facility.geocoordX,
    ]);
    const nearestDistance = getDistanceMeters(entrancePosition, [
      nearestFacility.geocoordY,
      nearestFacility.geocoordX,
    ]);

    return currentDistance < nearestDistance ? facility : nearestFacility;
  }, null);

  const shouldUseFallbackElevator = nearestActiveElevator == null && originTouchpoint == null;
  const elevatorPosition: LiveNavigationLatLng | null = nearestActiveElevator
    ? [nearestActiveElevator.geocoordY, nearestActiveElevator.geocoordX]
    : shouldUseFallbackElevator
      ? fallbackElevator.position
      : null;
  const elevatorLabel = nearestActiveElevator?.description ?? fallbackElevator.label;
  const elevatorDescription = nearestActiveElevator?.description ?? fallbackElevator.description;
  const elevatorInstruction = nearestActiveElevator
    ? `Nehmen Sie ${nearestActiveElevator.description}.`
    : fallbackElevator.instruction;

  const departurePosition: LiveNavigationLatLng | null = originTouchpoint?.departureStop
    ? [originTouchpoint.departureStop.latitude, originTouchpoint.departureStop.longitude]
    : null;
  const destinationPosition =
    departurePosition && isValidLatLngTuple(departurePosition)
      ? departurePosition
      : fallbackDeparture.position;

  const routePoints: LiveNavigationRoutePoint[] = [
    {
      description: entranceDescription,
      id: 'origin-entrance',
      instruction: originTouchpoint?.walkingApproach?.instruction ?? fallbackEntrance.instruction,
      label: entranceLabel,
      position: entrancePosition,
    },
    ...(elevatorPosition
      ? [
          {
            description: elevatorDescription,
            id: 'active-elevator-0',
            instruction: elevatorInstruction,
            label: elevatorLabel,
            position: elevatorPosition,
          } satisfies LiveNavigationRoutePoint,
        ]
      : []),
    {
      description: 'Sie haben den Abfahrtspunkt erreicht.',
      id: 'departure-stop',
      instruction: 'Sie sind am Abfahrtspunkt angekommen.',
      label: 'Abfahrtspunkt',
      position: destinationPosition,
    },
  ];

  const markers: LiveNavigationMapMarker[] = [
    {
      accessibleLabel: entranceLabel,
      id: 'origin-entrance',
      kind: 'entrance',
      label: entranceLabel,
      position: entrancePosition,
    },
    ...(elevatorPosition
      ? [
          {
            accessibleLabel: `${elevatorLabel}, Aufzug aktiv`,
            id: 'active-elevator-0',
            kind: 'active-elevator',
            label: elevatorLabel,
            position: elevatorPosition,
          } satisfies LiveNavigationMapMarker,
        ]
      : []),
    {
      accessibleLabel: 'Abfahrtspunkt',
      id: 'departure-stop',
      kind: 'departure',
      label: 'Abfahrtspunkt',
      position: destinationPosition,
    },
  ];

  return { hasAccessibleRoute: true, markers, routePoints, warningMessage: null };
}
