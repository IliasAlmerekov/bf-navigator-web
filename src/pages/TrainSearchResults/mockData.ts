import type { TrainRouteResponse } from './types';

function createRoute(
  route: Pick<
    TrainRouteResponse,
    'arrivalTime' | 'departureTime' | 'destination' | 'localizedDistanceText' | 'localizedDurationText' | 'origin'
  >,
  transit: TrainRouteResponse['transits'][number]
): TrainRouteResponse {
  return {
    ...route,
    transits: [transit],
  };
}

export const MOCK_ROUTES: TrainRouteResponse[] = [
  createRoute(
    {
      arrivalTime: '2026-04-02T07:40:00',
      departureTime: '2026-04-02T06:02:00',
      destination: 'Berlin Hbf',
      localizedDistanceText: '289 km',
      localizedDurationText: '1 Stunde 38 Minuten',
      origin: 'Hamburg Hbf',
    },
    {
      agencyName: 'DB Fernverkehr AG',
      arrival: {
        arrivalTime: '2026-04-02T07:40:00',
        facilities: [],
        station: {
          category: 1,
          city: 'Berlin',
          evaNumber: 8011160,
          hasMobilityService: 'yes',
          hasSteplessAccess: 'yes',
          hasWiFi: true,
          name: 'Berlin Hbf',
          number: 8011160,
        },
        stationName: 'Berlin Hbf',
      },
      departure: {
        departureTime: '2026-04-02T06:02:00',
        facilities: [],
        station: {
          category: 1,
          city: 'Hamburg',
          evaNumber: 8002549,
          hasMobilityService: 'yes',
          hasSteplessAccess: 'yes',
          hasWiFi: true,
          name: 'Hamburg Hbf',
          number: 8002549,
        },
        stationName: 'Hamburg Hbf',
      },
      trainName: 'ICE 1007',
      vehicleType: 'Hochgeschwindigkeitszug',
    }
  ),
  createRoute(
    {
      arrivalTime: '2026-04-02T08:56:00',
      departureTime: '2026-04-02T07:02:00',
      destination: 'Berlin Ostbahnhof',
      localizedDistanceText: '286 km',
      localizedDurationText: '1 Stunde 54 Minuten',
      origin: 'Hamburg Hbf',
    },
    {
      agencyName: 'DB Fernverkehr AG',
      arrival: {
        arrivalTime: '2026-04-02T08:56:00',
        facilities: [],
        station: {
          category: 2,
          city: 'Berlin',
          evaNumber: 8011162,
          hasMobilityService: 'yes',
          hasSteplessAccess: 'yes',
          hasWiFi: true,
          name: 'Berlin Ostbahnhof',
          number: 8011162,
        },
        stationName: 'Berlin Ostbahnhof',
      },
      departure: {
        departureTime: '2026-04-02T07:02:00',
        facilities: [],
        station: {
          category: 1,
          city: 'Hamburg',
          evaNumber: 8002549,
          hasMobilityService: 'yes',
          hasSteplessAccess: 'yes',
          hasWiFi: true,
          name: 'Hamburg Hbf',
          number: 8002549,
        },
        stationName: 'Hamburg Hbf',
      },
      trainName: 'ICE 1605',
      vehicleType: 'Hochgeschwindigkeitszug',
    }
  ),
  createRoute(
    {
      arrivalTime: '2026-04-02T11:12:00',
      departureTime: '2026-04-02T08:15:00',
      destination: 'Berlin Hbf',
      localizedDistanceText: '295 km',
      localizedDurationText: '2 Stunden 57 Minuten',
      origin: 'Hamburg Hbf',
    },
    {
      agencyName: 'DB Fernverkehr AG',
      arrival: {
        arrivalTime: '2026-04-02T11:12:00',
        facilities: [],
        station: {
          category: 1,
          city: 'Berlin',
          evaNumber: 8011160,
          hasMobilityService: 'yes',
          hasSteplessAccess: 'yes',
          hasWiFi: true,
          name: 'Berlin Hbf',
          number: 8011160,
        },
        stationName: 'Berlin Hbf',
      },
      departure: {
        departureTime: '2026-04-02T08:15:00',
        facilities: [],
        station: {
          category: 1,
          city: 'Hamburg',
          evaNumber: 8002549,
          hasMobilityService: 'yes',
          hasSteplessAccess: 'yes',
          hasWiFi: true,
          name: 'Hamburg Hbf',
          number: 8002549,
        },
        stationName: 'Hamburg Hbf',
      },
      trainName: 'ICE 707',
      vehicleType: 'Hochgeschwindigkeitszug',
    }
  ),
];
