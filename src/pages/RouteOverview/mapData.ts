import type { DbStationFacility, RouteMapData, RouteMapLatLng, RouteMapMarker } from './types';

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
    description: 'to platform 1/2',
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
    description: 'north concourse lift',
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

function formatFacilityType(type: string) {
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

  return {
    description: facility.description,
    id: `facility-${facility.equipmentnumber}`,
    kind: 'facility',
    label: formatFacilityType(facility.type),
    position,
    status: mapFacilityStatus(facility),
  };
}

export function buildRouteOverviewMapData(
  facilities: DbStationFacility[] = ROUTE_OVERVIEW_FACILITIES_MOCK
): RouteMapData {
  const facilityMarkers = facilities
    .map(mapDbFacilityToRouteMapMarker)
    .filter((marker): marker is RouteMapMarker => marker !== null);

  return {
    ariaLabel: 'Route map preview from Frankfurt Hbf to Berlin Hbf',
    center: [51.35, 10.95],
    markers: [
      {
        description: 'Departure station',
        id: 'route-origin-frankfurt',
        kind: 'origin',
        label: 'Frankfurt Hbf',
        position: ROUTE_PATH[0],
        status: 'default',
      },
      {
        description: 'Transfer station',
        id: 'route-transfer-kassel',
        kind: 'transfer',
        label: 'Kassel-Wilhelmshoehe',
        position: ROUTE_PATH[2],
        status: 'default',
      },
      {
        description: 'Arrival station',
        id: 'route-destination-berlin',
        kind: 'destination',
        label: 'Berlin Hbf',
        position: ROUTE_PATH[ROUTE_PATH.length - 1],
        status: 'default',
      },
      ...facilityMarkers,
    ],
    maxZoom: 8,
    minZoom: 5,
    routePath: ROUTE_PATH,
    zoom: 6,
  };
}

export const ROUTE_OVERVIEW_MAP_DATA = buildRouteOverviewMapData();
