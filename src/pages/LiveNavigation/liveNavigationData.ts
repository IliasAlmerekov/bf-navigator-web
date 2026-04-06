export type LiveNavigationLatLng = [number, number];

export type LiveNavigationRoutePoint = {
  description: string;
  id: string;
  instruction: string;
  label: string;
  position: LiveNavigationLatLng;
};

export type LiveNavigationDestination = {
  id: string;
  label: string;
  position: LiveNavigationLatLng;
};

export type LiveNavigationManualStart = {
  description: string;
  id: string;
  label: string;
  routePointId: string;
};

export const LIVE_NAVIGATION_DESTINATION: LiveNavigationDestination = {
  id: 'platform-1',
  label: 'Gleis 1',
  position: [50.10772, 8.66292],
};

export const LIVE_NAVIGATION_ROUTE_POINTS: LiveNavigationRoutePoint[] = [
  {
    description: 'Sie stehen am Haupteingang.',
    id: 'main-entrance',
    instruction: 'Gehen Sie geradeaus in Richtung Bahnhofshalle.',
    label: 'Haupteingang',
    position: [50.1071, 8.6638],
  },
  {
    description: 'Der nächste barrierefreie Orientierungspunkt ist der Aufzug E4.',
    id: 'elevator-e4',
    instruction: 'Folgen Sie dem Leitsystem bis zum Aufzug E4.',
    label: 'Aufzug E4',
    position: [50.10736, 8.66312],
  },
  {
    description: 'Sie befinden sich am Info Point vor dem Gleiszugang.',
    id: 'info-point',
    instruction: 'Biegen Sie links ab und folgen Sie der Beschilderung zu Gleis 1.',
    label: 'Info Point',
    position: [50.10754, 8.66301],
  },
  {
    description: 'Sie haben Gleis 1 erreicht.',
    id: 'platform-1',
    instruction: 'Sie sind an Gleis 1 angekommen.',
    label: 'Gleis 1',
    position: [50.10772, 8.66292],
  },
];

export const LIVE_NAVIGATION_MANUAL_STARTS: LiveNavigationManualStart[] = [
  {
    description: 'Starten Sie am Haupteingang des Bahnhofs.',
    id: 'main-entrance',
    label: 'Haupteingang',
    routePointId: 'main-entrance',
  },
  {
    description: 'Starten Sie am Aufzug E4.',
    id: 'elevator-e4',
    label: 'Aufzug E4',
    routePointId: 'elevator-e4',
  },
  {
    description: 'Starten Sie am Info Point.',
    id: 'info-point',
    label: 'Info Point',
    routePointId: 'info-point',
  },
];
