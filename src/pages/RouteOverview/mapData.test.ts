import { describe, expect, it } from 'vitest';
import { mapDbFacilityToRouteMapMarker, toLeafletPosition } from './mapData';
import type { DbStationFacility } from './types';

describe('mapData', () => {
  it('maps DB geocoordX/geocoordY into Leaflet latitude-longitude order', () => {
    expect(toLeafletPosition(13.41118355, 52.52138805)).toEqual([52.52138805, 13.41118355]);
  });

  it('creates a facility marker from a backend-style facility payload', () => {
    const facility: DbStationFacility = {
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

    expect(mapDbFacilityToRouteMapMarker(facility)).toEqual({
      description: 'to platform 1/2',
      id: 'facility-10431463',
      kind: 'facility',
      label: 'Rolltreppe',
      locationDetail: 'to platform 1/2',
      position: [52.52138805, 13.41118355],
      statusLabel: 'In Betrieb',
      status: 'available',
    });
  });
});
