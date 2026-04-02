import { describe, expect, it } from 'vitest';
import type {
  TrainRouteFacility,
  TrainRouteResponse,
  TrainRouteStation,
  TrainRouteStop,
  TrainRouteTransit,
} from './types';

describe('TrainSearchResults DTO types', () => {
  it('models the backend train route response shape', () => {
    const station: TrainRouteStation = {
      category: 1,
      city: 'Hamburg',
      evaNumber: 8002549,
      hasMobilityService: 'yes',
      hasSteplessAccess: 'yes',
      hasWiFi: true,
      name: 'Hamburg Hbf',
      number: 12345,
    };

    const facility: TrainRouteFacility = {
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
    };

    const departure: TrainRouteStop = {
      departureTime: '2026-04-02T08:29:00Z',
      facilities: [facility],
      station,
      stationName: 'Hamburg Hauptbahnhof',
    };

    const arrival: TrainRouteStop = {
      arrivalTime: '2026-04-02T09:48:00Z',
      facilities: [],
      station: {
        ...station,
        city: 'Hannover',
        evaNumber: 8000152,
        name: 'Hannover Hbf',
        number: 23456,
      },
      stationName: 'Hannover Hauptbahnhof',
    };

    const transit: TrainRouteTransit = {
      agencyName: 'DB Fernverkehr AG',
      arrival,
      departure,
      trainName: 'ICE 579',
      vehicleType: 'Hochgeschwindigkeitszug',
    };

    const route: TrainRouteResponse = {
      arrivalTime: '2026-04-02T10:45:00Z',
      departureTime: '2026-04-02T08:29:00Z',
      destination: 'Braunschweig Hbf',
      localizedDistanceText: '240 km',
      localizedDurationText: '2 Stunden, 20 Minuten',
      origin: 'Hamburg Hbf',
      transits: [transit],
    };

    expect(route.transits[0]?.trainName).toBe('ICE 579');
    expect(route.transits[0]?.departure.station.hasSteplessAccess).toBe('yes');
  });
});
