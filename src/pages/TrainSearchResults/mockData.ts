import type { RouteResult } from './types';

export const MOCK_ROUTES: RouteResult[] = [
  {
    legs: [
      {
        steps: [
          {
            distanceMeters: 200,
            staticDuration: '3m',
            travelMode: 'WALK',
            localizedValues: { distance: { text: '200 m' }, staticDuration: { text: '3 Min.' } },
          },
          {
            distanceMeters: 285700,
            staticDuration: '1h38m',
            travelMode: 'TRANSIT',
            localizedValues: {
              distance: { text: '285,7 km' },
              staticDuration: { text: '1 Std. 38 Min.' },
            },
            transitDetails: {
              stopDetails: {
                departureStop: { name: 'Hamburg Hbf' },
                arrivalStop: { name: 'Berlin Hbf' },
                departureTime: '2026-04-02T06:02:00',
                arrivalTime: '2026-04-02T07:40:00',
              },
              localizedValues: {
                departureTime: { time: { text: '06:02' }, timeZone: 'Europe/Berlin' },
                arrivalTime: { time: { text: '07:40' }, timeZone: 'Europe/Berlin' },
              },
              headsign: 'Berlin Hbf',
              stopCount: 3,
              transitLine: {
                agencies: [{ name: 'Deutsche Bahn' }],
                name: 'ICE 874',
                nameShort: 'ICE 874',
                color: '#002068',
                textColor: '#ffffff',
                vehicle: {
                  name: { text: 'Intercity-Express' },
                  type: 'HIGH_SPEED_TRAIN',
                },
              },
            },
          },
        ],
        distanceMeters: 286000,
        duration: '1h41m',
        staticDuration: '1h41m',
        localizedValues: {
          distance: { text: '286 km' },
          duration: { text: '1 Std. 41 Min.' },
          staticDuration: { text: '1 Std. 41 Min.' },
        },
      },
    ],
    distanceMeters: 286000,
    duration: '1h41m',
    staticDuration: '1h41m',
    localizedValues: {
      distance: { text: '286 km' },
      duration: { text: '1 Std. 41 Min.' },
      staticDuration: { text: '1 Std. 41 Min.' },
    },
  },
  {
    legs: [
      {
        steps: [
          {
            distanceMeters: 288900,
            staticDuration: '1h54m',
            travelMode: 'TRANSIT',
            localizedValues: {
              distance: { text: '288,9 km' },
              staticDuration: { text: '1 Std. 54 Min.' },
            },
            transitDetails: {
              stopDetails: {
                departureStop: { name: 'Hamburg Hbf' },
                arrivalStop: { name: 'Berlin Ostbahnhof' },
                departureTime: '2026-04-02T07:02:00',
                arrivalTime: '2026-04-02T08:56:00',
              },
              localizedValues: {
                departureTime: { time: { text: '07:02' }, timeZone: 'Europe/Berlin' },
                arrivalTime: { time: { text: '08:56' }, timeZone: 'Europe/Berlin' },
              },
              headsign: 'Berlin Ostbahnhof',
              stopCount: 4,
              transitLine: {
                agencies: [{ name: 'Deutsche Bahn' }],
                name: 'ICE 700',
                nameShort: 'ICE 700',
                color: '#002068',
                textColor: '#ffffff',
                vehicle: {
                  name: { text: 'Intercity-Express' },
                  type: 'HIGH_SPEED_TRAIN',
                },
              },
            },
          },
        ],
        distanceMeters: 288900,
        duration: '1h54m',
        staticDuration: '1h54m',
        localizedValues: {
          distance: { text: '288,9 km' },
          duration: { text: '1 Std. 54 Min.' },
          staticDuration: { text: '1 Std. 54 Min.' },
        },
      },
    ],
    distanceMeters: 288900,
    duration: '1h54m',
    staticDuration: '1h54m',
    localizedValues: {
      distance: { text: '288,9 km' },
      duration: { text: '1 Std. 54 Min.' },
      staticDuration: { text: '1 Std. 54 Min.' },
    },
  },
  {
    legs: [
      {
        steps: [
          {
            distanceMeters: 150,
            staticDuration: '2m',
            travelMode: 'WALK',
            localizedValues: { distance: { text: '150 m' }, staticDuration: { text: '2 Min.' } },
          },
          {
            distanceMeters: 42000,
            staticDuration: '22m',
            travelMode: 'TRANSIT',
            localizedValues: {
              distance: { text: '42 km' },
              staticDuration: { text: '22 Min.' },
            },
            transitDetails: {
              stopDetails: {
                departureStop: { name: 'Hamburg Hbf' },
                arrivalStop: { name: 'Hamburg-Harburg' },
                departureTime: '2026-04-02T08:15:00',
                arrivalTime: '2026-04-02T08:37:00',
              },
              localizedValues: {
                departureTime: { time: { text: '08:15' }, timeZone: 'Europe/Berlin' },
                arrivalTime: { time: { text: '08:37' }, timeZone: 'Europe/Berlin' },
              },
              headsign: 'Hamburg-Harburg',
              stopCount: 2,
              transitLine: {
                agencies: [{ name: 'Deutsche Bahn' }],
                name: 'IC 2215',
                nameShort: 'IC 2215',
                color: '#c0392b',
                textColor: '#ffffff',
                vehicle: {
                  name: { text: 'Intercity' },
                  type: 'INTERCITY_BUS',
                },
              },
            },
          },
          {
            distanceMeters: 8000,
            staticDuration: '12m',
            travelMode: 'WALK',
            localizedValues: { distance: { text: '8 km' }, staticDuration: { text: '12 Min.' } },
          },
          {
            distanceMeters: 246000,
            staticDuration: '2h10m',
            travelMode: 'TRANSIT',
            localizedValues: {
              distance: { text: '246 km' },
              staticDuration: { text: '2 Std. 10 Min.' },
            },
            transitDetails: {
              stopDetails: {
                departureStop: { name: 'Hamburg-Harburg' },
                arrivalStop: { name: 'Berlin Hbf' },
                departureTime: '2026-04-02T09:02:00',
                arrivalTime: '2026-04-02T11:12:00',
              },
              localizedValues: {
                departureTime: { time: { text: '09:02' }, timeZone: 'Europe/Berlin' },
                arrivalTime: { time: { text: '11:12' }, timeZone: 'Europe/Berlin' },
              },
              headsign: 'Berlin Hbf',
              stopCount: 6,
              transitLine: {
                agencies: [{ name: 'Deutsche Bahn' }],
                name: 'RE 3',
                nameShort: 'RE 3',
                color: '#27ae60',
                textColor: '#ffffff',
                vehicle: {
                  name: { text: 'Regionalexpress' },
                  type: 'RAIL',
                },
              },
            },
          },
        ],
        distanceMeters: 296000,
        duration: '2h57m',
        staticDuration: '2h57m',
        localizedValues: {
          distance: { text: '296 km' },
          duration: { text: '2 Std. 57 Min.' },
          staticDuration: { text: '2 Std. 57 Min.' },
        },
      },
    ],
    distanceMeters: 296000,
    duration: '2h57m',
    staticDuration: '2h57m',
    localizedValues: {
      distance: { text: '296 km' },
      duration: { text: '2 Std. 57 Min.' },
      staticDuration: { text: '2 Std. 57 Min.' },
    },
  },
  {
    legs: [
      {
        steps: [
          {
            distanceMeters: 290000,
            staticDuration: '1h48m',
            travelMode: 'TRANSIT',
            localizedValues: {
              distance: { text: '290 km' },
              staticDuration: { text: '1 Std. 48 Min.' },
            },
            transitDetails: {
              stopDetails: {
                departureStop: { name: 'Hamburg Hbf' },
                arrivalStop: { name: 'Berlin Hbf' },
                departureTime: '2026-04-02T10:02:00',
                arrivalTime: '2026-04-02T11:50:00',
              },
              localizedValues: {
                departureTime: { time: { text: '10:02' }, timeZone: 'Europe/Berlin' },
                arrivalTime: { time: { text: '11:50' }, timeZone: 'Europe/Berlin' },
              },
              headsign: 'Berlin Hbf',
              stopCount: 3,
              transitLine: {
                agencies: [{ name: 'Deutsche Bahn' }],
                name: 'ICE 582',
                nameShort: 'ICE 582',
                color: '#002068',
                textColor: '#ffffff',
                vehicle: {
                  name: { text: 'Intercity-Express' },
                  type: 'HIGH_SPEED_TRAIN',
                },
              },
            },
          },
        ],
        distanceMeters: 290000,
        duration: '1h48m',
        staticDuration: '1h48m',
        localizedValues: {
          distance: { text: '290 km' },
          duration: { text: '1 Std. 48 Min.' },
          staticDuration: { text: '1 Std. 48 Min.' },
        },
      },
    ],
    distanceMeters: 290000,
    duration: '1h48m',
    staticDuration: '1h48m',
    localizedValues: {
      distance: { text: '290 km' },
      duration: { text: '1 Std. 48 Min.' },
      staticDuration: { text: '1 Std. 48 Min.' },
    },
  },
  {
    legs: [
      {
        steps: [
          {
            distanceMeters: 284000,
            staticDuration: '1h39m',
            travelMode: 'TRANSIT',
            localizedValues: {
              distance: { text: '284 km' },
              staticDuration: { text: '1 Std. 39 Min.' },
            },
            transitDetails: {
              stopDetails: {
                departureStop: { name: 'Hamburg Hbf' },
                arrivalStop: { name: 'Berlin Hbf' },
                departureTime: '2026-04-02T12:02:00',
                arrivalTime: '2026-04-02T13:41:00',
              },
              localizedValues: {
                departureTime: { time: { text: '12:02' }, timeZone: 'Europe/Berlin' },
                arrivalTime: { time: { text: '13:41' }, timeZone: 'Europe/Berlin' },
              },
              headsign: 'Berlin Hbf',
              stopCount: 2,
              transitLine: {
                agencies: [{ name: 'Deutsche Bahn' }],
                name: 'ICE 276',
                nameShort: 'ICE 276',
                color: '#002068',
                textColor: '#ffffff',
                vehicle: {
                  name: { text: 'Intercity-Express' },
                  type: 'HIGH_SPEED_TRAIN',
                },
              },
            },
          },
        ],
        distanceMeters: 284000,
        duration: '1h39m',
        staticDuration: '1h39m',
        localizedValues: {
          distance: { text: '284 km' },
          duration: { text: '1 Std. 39 Min.' },
          staticDuration: { text: '1 Std. 39 Min.' },
        },
      },
    ],
    distanceMeters: 284000,
    duration: '1h39m',
    staticDuration: '1h39m',
    localizedValues: {
      distance: { text: '284 km' },
      duration: { text: '1 Std. 39 Min.' },
      staticDuration: { text: '1 Std. 39 Min.' },
    },
  },
  {
    legs: [
      {
        steps: [
          {
            distanceMeters: 293000,
            staticDuration: '1h52m',
            travelMode: 'TRANSIT',
            localizedValues: {
              distance: { text: '293 km' },
              staticDuration: { text: '1 Std. 52 Min.' },
            },
            transitDetails: {
              stopDetails: {
                departureStop: { name: 'Hamburg Hbf' },
                arrivalStop: { name: 'Berlin Hbf' },
                departureTime: '2026-04-02T14:02:00',
                arrivalTime: '2026-04-02T15:54:00',
              },
              localizedValues: {
                departureTime: { time: { text: '14:02' }, timeZone: 'Europe/Berlin' },
                arrivalTime: { time: { text: '15:54' }, timeZone: 'Europe/Berlin' },
              },
              headsign: 'Berlin Hbf',
              stopCount: 4,
              transitLine: {
                agencies: [{ name: 'Deutsche Bahn' }],
                name: 'ICE 102',
                nameShort: 'ICE 102',
                color: '#002068',
                textColor: '#ffffff',
                vehicle: {
                  name: { text: 'Intercity-Express' },
                  type: 'HIGH_SPEED_TRAIN',
                },
              },
            },
          },
        ],
        distanceMeters: 293000,
        duration: '1h52m',
        staticDuration: '1h52m',
        localizedValues: {
          distance: { text: '293 km' },
          duration: { text: '1 Std. 52 Min.' },
          staticDuration: { text: '1 Std. 52 Min.' },
        },
      },
    ],
    distanceMeters: 293000,
    duration: '1h52m',
    staticDuration: '1h52m',
    localizedValues: {
      distance: { text: '293 km' },
      duration: { text: '1 Std. 52 Min.' },
      staticDuration: { text: '1 Std. 52 Min.' },
    },
  },
];
