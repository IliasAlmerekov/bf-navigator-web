import type {
  LiveNavigationDestination,
  LiveNavigationLatLng,
  LiveNavigationManualStart,
  LiveNavigationRoutePoint,
} from './liveNavigationData';

type InstructionState = {
  currentLabel: string;
  currentStepDescription: string;
  destinationLabel: string;
  nextLabel: string;
  remainingDistanceMeters: number;
  routePoints: LiveNavigationRoutePoint[];
};

const EARTH_RADIUS_METERS = 6371000;

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
  const activeIndex = findNearestRoutePointIndex(position, routePoints);
  const activePoint = routePoints[activeIndex];
  const remainingRoutePoints = routePoints.slice(activeIndex);
  const nextTargetPoint =
    remainingRoutePoints[remainingRoutePoints.length - 1] ?? activePoint ?? routePoints[0];

  return {
    currentLabel: activePoint.label,
    currentStepDescription: activePoint.instruction,
    destinationLabel: destination.label,
    nextLabel: nextTargetPoint.label,
    remainingDistanceMeters: calculateRemainingDistanceMeters(activeIndex, routePoints),
    routePoints: remainingRoutePoints,
  };
}
