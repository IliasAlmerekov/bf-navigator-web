import type {
  LiveNavigationDestination,
  LiveNavigationLatLng,
  LiveNavigationManualStart,
  LiveNavigationRoutePoint,
} from './liveNavigationData';
import type { TrainRouteFacility, TrainRouteTouchpoint } from '../TrainSearchResults/types';

type InstructionState = {
  currentLabel: string;
  currentStepDescription: string;
  destinationLabel: string;
  nextLabel: string;
  remainingDistanceMeters: number;
  routePoints: LiveNavigationRoutePoint[];
};

const EARTH_RADIUS_METERS = 6371000;
const MAX_FACILITY_DERIVED_MARKERS = 50;

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
  if (!originTouchpoint) {
    return { hasAccessibleRoute: false, markers: [], routePoints: [], warningMessage: null };
  }

  const markers: LiveNavigationMapMarker[] = [];
  const routePoints: LiveNavigationRoutePoint[] = [];

  const walkingApproachPosition: LiveNavigationLatLng | null = originTouchpoint.walkingApproach
    ? [originTouchpoint.walkingApproach.latitude, originTouchpoint.walkingApproach.longitude]
    : null;
  const hasValidWalkingApproachCoordinates = Boolean(
    walkingApproachPosition && isValidLatLngTuple(walkingApproachPosition)
  );

  if (
    originTouchpoint.walkingApproach &&
    walkingApproachPosition &&
    hasValidWalkingApproachCoordinates
  ) {
    markers.push({
      accessibleLabel: 'Haupteingang',
      id: 'origin-entrance',
      kind: 'entrance',
      label: 'Haupteingang',
      position: walkingApproachPosition,
    });
    routePoints.push({
      description: 'Sie stehen am Haupteingang.',
      id: 'origin-entrance',
      instruction: originTouchpoint.walkingApproach.instruction,
      label: 'Haupteingang',
      position: walkingApproachPosition,
    });
  }

  const facilities = originTouchpoint.facilities ?? [];
  const activeElevators = facilities
    .filter(
      (facility): facility is TrainRouteFacility & { geocoordX: number; geocoordY: number } =>
        facility.type === 'ELEVATOR' &&
        facility.state === 'ACTIVE' &&
        hasValidFacilityCoordinates(facility)
    )
    .slice(0, MAX_FACILITY_DERIVED_MARKERS);

  activeElevators.forEach((facility, index) => {
    const position: LiveNavigationLatLng = [facility.geocoordY, facility.geocoordX];
    markers.push({
      accessibleLabel: `${facility.description}, Aufzug aktiv`,
      id: `active-elevator-${index}`,
      kind: 'active-elevator',
      label: facility.description,
      position,
    });
    routePoints.push({
      description: facility.description,
      id: `active-elevator-${index}`,
      instruction: `Nehmen Sie ${facility.description}.`,
      label: facility.description,
      position,
    });
  });

  const remainingFacilityMarkerCapacity = Math.max(
    0,
    MAX_FACILITY_DERIVED_MARKERS - activeElevators.length
  );
  const orientationFacilities = facilities
    .filter(
      (facility): facility is TrainRouteFacility & { geocoordX: number; geocoordY: number } =>
        hasValidFacilityCoordinates(facility) &&
        ((facility.type === 'ELEVATOR' && facility.state === 'INACTIVE') ||
          facility.type === 'ESCALATOR')
    )
    .slice(0, remainingFacilityMarkerCapacity);

  orientationFacilities.forEach((facility, index) => {
    const position: LiveNavigationLatLng = [facility.geocoordY, facility.geocoordX];

    if (facility.type === 'ELEVATOR') {
      markers.push({
        accessibleLabel: `${facility.description}, Aufzug außer Betrieb`,
        id: `inactive-elevator-${index}`,
        kind: 'inactive-elevator',
        label: facility.description,
        position,
      });
      return;
    }

    markers.push({
      accessibleLabel: `${facility.description}, Rolltreppe nur zur Orientierung`,
      id: `escalator-${index}`,
      kind: 'escalator',
      label: facility.description,
      position,
    });
  });

  const departurePosition: LiveNavigationLatLng | null = originTouchpoint.departureStop
    ? [originTouchpoint.departureStop.latitude, originTouchpoint.departureStop.longitude]
    : null;
  const hasValidDepartureCoordinates = Boolean(
    departurePosition && isValidLatLngTuple(departurePosition)
  );

  if (originTouchpoint.departureStop && departurePosition && hasValidDepartureCoordinates) {
    markers.push({
      accessibleLabel: 'Abfahrtspunkt',
      id: 'departure-stop',
      kind: 'departure',
      label: 'Abfahrtspunkt',
      position: departurePosition,
    });
    routePoints.push({
      description: 'Sie haben den Abfahrtspunkt erreicht.',
      id: 'departure-stop',
      instruction: 'Sie sind am Abfahrtspunkt angekommen.',
      label: 'Abfahrtspunkt',
      position: departurePosition,
    });
  }

  const hasAccessibleRoute =
    hasValidWalkingApproachCoordinates &&
    activeElevators.length > 0 &&
    hasValidDepartureCoordinates;

  return {
    hasAccessibleRoute,
    markers,
    routePoints: hasAccessibleRoute ? routePoints : [],
    warningMessage: hasAccessibleRoute
      ? null
      : 'Der barrierefreie Weg zum Abfahrtspunkt ist derzeit nicht verfügbar.',
  };
}
