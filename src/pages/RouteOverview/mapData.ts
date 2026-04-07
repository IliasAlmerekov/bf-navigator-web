import type { DbStationFacility, RouteMapData, RouteMapLatLng, RouteMapMarker } from './types';

const DEFAULT_CENTER: RouteMapLatLng = [51.35, 10.95];

const ROUTE_PATH: RouteMapLatLng[] = [
  [50.1071, 8.6638],
  [50.5558, 9.6808],
  [51.3127, 9.4797],
  [51.8452, 10.7944],
  [52.3485, 11.7064],
  [52.5251, 13.3694],
];

const ROUTE_OVERVIEW_FACILITIES_MOCK: DbStationFacility[] = [
  {
    description: 'zu Gleis 1/2',
    equipmentnumber: 10431463,
    geocoordX: 13.41118355,
    geocoordY: 52.52138805,
    operationalResumeDate: null,
    operatorname: 'DB InfraGO',
    state: 'ACTIVE',
    stateExplanation: 'available',
    stationnumber: 53,
    type: 'ESCALATOR',
  },
  {
    description: 'Aufzug zur Nordhalle',
    equipmentnumber: 10431492,
    geocoordX: 13.3709,
    geocoordY: 52.5256,
    operationalResumeDate: null,
    operatorname: 'DB InfraGO',
    state: 'ACTIVE',
    stateExplanation: 'available',
    stationnumber: 53,
    type: 'ELEVATOR',
  },
];

function clampCoordinate(value: number | null) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function toLeafletPosition(
  geocoordX: number | null,
  geocoordY: number | null
): RouteMapLatLng | null {
  const longitude = clampCoordinate(geocoordX);
  const latitude = clampCoordinate(geocoordY);

  if (longitude === null || latitude === null) {
    return null;
  }

  return [latitude, longitude];
}

function mapFacilityStatus(facility: DbStationFacility): RouteMapMarker['status'] {
  if (facility.stateExplanation === 'available' || facility.state === 'ACTIVE') {
    return 'available';
  }

  if (facility.stateExplanation === 'limited') {
    return 'limited';
  }

  return 'unavailable';
}

function formatFacilityStatus(status: RouteMapMarker['status']) {
  if (status === 'available') {
    return 'In Betrieb';
  }

  if (status === 'limited') {
    return 'Eingeschränkt verfügbar';
  }

  return 'Außer Betrieb';
}

function formatFacilityType(type: string) {
  if (type === 'ELEVATOR') {
    return 'Aufzug';
  }

  if (type === 'ESCALATOR') {
    return 'Rolltreppe';
  }

  return type
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function mapDbFacilityToRouteMapMarker(facility: DbStationFacility): RouteMapMarker | null {
  const position = toLeafletPosition(facility.geocoordX, facility.geocoordY);

  if (!position) {
    return null;
  }

  const status = mapFacilityStatus(facility);
  const label = formatFacilityType(facility.type);

  return {
    description: facility.description,
    id: `facility-${facility.equipmentnumber}`,
    kind: 'facility',
    label,
    locationDetail: facility.description,
    position,
    statusLabel: formatFacilityStatus(status),
    status,
  };
}

type RouteMapLabels = {
  ariaLabel?: string;
  destinationLabel?: string;
  originLabel?: string;
  transferLabel?: string;
};

type BuildRouteOverviewMapOptions = {
  center?: RouteMapLatLng;
  facilities?: DbStationFacility[];
  labels?: RouteMapLabels;
  routePath?: RouteMapLatLng[];
  stopMarkers?: RouteMapMarker[];
};

function buildDefaultStopMarkers(labels: RouteMapLabels): RouteMapMarker[] {
  return [
    {
      description: 'Startbahnhof',
      id: 'route-origin-frankfurt',
      kind: 'origin',
      label: labels.originLabel ?? 'Frankfurt Hbf',
      position: ROUTE_PATH[0],
      status: 'default',
    },
    {
      description: 'Umstiegsbahnhof',
      id: 'route-transfer-kassel',
      kind: 'transfer',
      label: labels.transferLabel ?? 'Kassel-Wilhelmshoehe',
      position: ROUTE_PATH[2],
      status: 'default',
    },
    {
      description: 'Zielbahnhof',
      id: 'route-destination-berlin',
      kind: 'destination',
      label: labels.destinationLabel ?? 'Berlin Hbf',
      position: ROUTE_PATH[ROUTE_PATH.length - 1],
      status: 'default',
    },
  ];
}

function calculateMapCenter(
  routePath: RouteMapLatLng[],
  markers: RouteMapMarker[],
  fallbackCenter: RouteMapLatLng
) {
  const sourcePositions =
    routePath.length > 0 ? routePath : markers.map((marker) => marker.position);

  if (sourcePositions.length === 0) {
    return fallbackCenter;
  }

  const [latitudeSum, longitudeSum] = sourcePositions.reduce(
    ([currentLatitude, currentLongitude], [latitude, longitude]) => [
      currentLatitude + latitude,
      currentLongitude + longitude,
    ],
    [0, 0]
  );

  return [
    latitudeSum / sourcePositions.length,
    longitudeSum / sourcePositions.length,
  ] satisfies RouteMapLatLng;
}

export function buildRouteOverviewMapData({
  center,
  facilities = ROUTE_OVERVIEW_FACILITIES_MOCK,
  labels = {},
  routePath,
  stopMarkers,
}: BuildRouteOverviewMapOptions = {}): RouteMapData {
  const facilityMarkers = facilities
    .map(mapDbFacilityToRouteMapMarker)
    .filter((marker): marker is RouteMapMarker => marker !== null);
  const routeMarkers = stopMarkers ?? buildDefaultStopMarkers(labels);
  const resolvedRoutePath = routePath && routePath.length > 0 ? routePath : ROUTE_PATH;
  const resolvedMarkers = [...routeMarkers, ...facilityMarkers];
  const resolvedCenter =
    center ?? calculateMapCenter(resolvedRoutePath, resolvedMarkers, DEFAULT_CENTER);

  return {
    ariaLabel: labels.ariaLabel ?? 'Routenvorschau von Frankfurt Hbf nach Berlin Hbf',
    center: resolvedCenter,
    markers: resolvedMarkers,
    maxZoom: 8,
    minZoom: 5,
    routePath: resolvedRoutePath,
    zoom: 6,
  };
}

export const ROUTE_OVERVIEW_MAP_DATA = buildRouteOverviewMapData();
