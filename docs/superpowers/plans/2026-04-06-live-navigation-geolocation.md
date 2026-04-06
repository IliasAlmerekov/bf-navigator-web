# Live Navigation Geolocation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/live-navigation` placeholder with a text-first, accessible mock that requests browser geolocation on load, live-tracks the user with `watchPosition`, and falls back to manual start-point selection when live location is unavailable.

**Architecture:** Keep the browser geolocation integration in `LiveNavigation.tsx`, move hardcoded route data into a dedicated data module, and put route math into pure utilities that can be tested without React. The page stays text-first for accessibility, while `LiveNavigationMap` becomes a secondary visualization fed entirely by props so the current mock data can later be swapped for a real API adapter.

**Tech Stack:** React 19, TypeScript 5.9, TanStack Router, Vitest, React Testing Library, Leaflet, CSS Modules, browser Geolocation API

---

## File Structure

- Create: `src/pages/LiveNavigation/liveNavigationData.ts`
  Hardcoded destination, route points, manual fallback starts, and map labels for the mock phase.
- Create: `src/pages/LiveNavigation/liveNavigationUtils.ts`
  Pure distance and route-progression helpers.
- Create: `src/pages/LiveNavigation/liveNavigationUtils.test.ts`
  TDD coverage for route math and fallback routing.
- Create: `src/pages/LiveNavigation/LiveNavigation.test.tsx`
  Page-level geolocation, fallback, and accessibility behavior tests.
- Create: `src/pages/LiveNavigation/components/NavigationInstructions.tsx`
  Primary text-first guidance surface.
- Create: `src/pages/LiveNavigation/components/ManualStartSelector.tsx`
  Keyboard-accessible fallback start selector.
- Modify: `src/pages/LiveNavigation/LiveNavigation.tsx`
  Page orchestration and state handling.
- Modify: `src/pages/LiveNavigation/LiveNavigation.module.css`
  Add styles for status, manual fallback, and text-first layout.
- Modify: `src/pages/LiveNavigation/components/LiveNavigationMap.tsx`
  Accept current position, destination, and route path through props instead of internal constants.
- Modify: `src/pages/LiveNavigation/components/LiveNavigationMap.module.css`
  Minor class additions only if the new text-first layout needs them.

### Task 1: Build Mock Route Data and Pure Routing Utilities

**Files:**
- Create: `src/pages/LiveNavigation/liveNavigationData.ts`
- Create: `src/pages/LiveNavigation/liveNavigationUtils.ts`
- Test: `src/pages/LiveNavigation/liveNavigationUtils.test.ts`

- [ ] **Step 1: Write the failing utility test**

```ts
import { describe, expect, it } from 'vitest';
import {
  LIVE_NAVIGATION_DESTINATION,
  LIVE_NAVIGATION_MANUAL_STARTS,
  LIVE_NAVIGATION_ROUTE_POINTS,
} from './liveNavigationData';
import {
  buildInstructionState,
  calculateRemainingDistanceMeters,
  findNearestRoutePointIndex,
  getRoutePointsFromManualStart,
} from './liveNavigationUtils';

describe('liveNavigationUtils', () => {
  it('finds the nearest route point for a live browser position', () => {
    expect(
      findNearestRoutePointIndex([50.10712, 8.66376], LIVE_NAVIGATION_ROUTE_POINTS)
    ).toBe(0);
  });

  it('calculates a non-zero remaining distance from the active route point to the destination', () => {
    const remainingDistance = calculateRemainingDistanceMeters(1, LIVE_NAVIGATION_ROUTE_POINTS);

    expect(remainingDistance).toBeGreaterThan(0);
    expect(remainingDistance).toBeLessThan(250);
  });

  it('builds text-first instruction state for the current live position', () => {
    expect(
      buildInstructionState({
        destination: LIVE_NAVIGATION_DESTINATION,
        position: [50.10736, 8.66312],
        routePoints: LIVE_NAVIGATION_ROUTE_POINTS,
      })
    ).toMatchObject({
      currentLabel: 'Aufzug E4',
      destinationLabel: 'Gleis 1',
      nextLabel: 'Gleis 1',
    });
  });

  it('derives a fallback route segment from the selected manual start point', () => {
    expect(
      getRoutePointsFromManualStart('info-point', LIVE_NAVIGATION_MANUAL_STARTS, LIVE_NAVIGATION_ROUTE_POINTS)
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'info-point' }),
        expect.objectContaining({ id: 'platform-1' }),
      ])
    );
  });
});
```

- [ ] **Step 2: Run the utility test to verify it fails**

Run:

```bash
rtk vitest run src/pages/LiveNavigation/liveNavigationUtils.test.ts
```

Expected: FAIL because `liveNavigationData.ts` and `liveNavigationUtils.ts` do not exist yet.

- [ ] **Step 3: Write the minimal data and utility implementation**

Create `src/pages/LiveNavigation/liveNavigationData.ts`:

```ts
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
```

Create `src/pages/LiveNavigation/liveNavigationUtils.ts`:

```ts
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
```

- [ ] **Step 4: Run the utility test to verify it passes**

Run:

```bash
rtk vitest run src/pages/LiveNavigation/liveNavigationUtils.test.ts
```

Expected: PASS with 4 tests green.

- [ ] **Step 5: Commit the utility layer**

```bash
rtk git add src/pages/LiveNavigation/liveNavigationData.ts src/pages/LiveNavigation/liveNavigationUtils.ts src/pages/LiveNavigation/liveNavigationUtils.test.ts
rtk git commit -m "feat: add live navigation route utilities"
```

### Task 2: Implement Page Geolocation Flow, Fallback UI, and Map Props

**Files:**
- Create: `src/pages/LiveNavigation/LiveNavigation.test.tsx`
- Create: `src/pages/LiveNavigation/components/NavigationInstructions.tsx`
- Create: `src/pages/LiveNavigation/components/ManualStartSelector.tsx`
- Modify: `src/pages/LiveNavigation/LiveNavigation.tsx`
- Modify: `src/pages/LiveNavigation/LiveNavigation.module.css`
- Modify: `src/pages/LiveNavigation/components/LiveNavigationMap.tsx`
- Modify: `src/pages/LiveNavigation/components/LiveNavigationMap.module.css`

- [ ] **Step 1: Write the failing page behavior test**

Create `src/pages/LiveNavigation/LiveNavigation.test.tsx`:

```tsx
import type { ReactNode } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LiveNavigation from './LiveNavigation';

const liveNavigationMapMock = vi.fn();
const watchPositionMock = vi.fn();
const clearWatchMock = vi.fn();

type WatchSuccess = Parameters<typeof navigator.geolocation.watchPosition>[0];
type WatchError = Parameters<typeof navigator.geolocation.watchPosition>[1];

let watchSuccessCallback: WatchSuccess | undefined;
let watchErrorCallback: WatchError | undefined;

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    className,
    to,
    'aria-label': ariaLabel,
  }: {
    children: ReactNode;
    className?: string;
    to: string;
    'aria-label'?: string;
  }) => (
    <a className={className} href={to} aria-label={ariaLabel}>
      {children}
    </a>
  ),
}));

vi.mock('./components/LiveNavigationMap', () => ({
  LiveNavigationMap: (props: unknown) => {
    liveNavigationMapMock(props);
    return <div data-testid="live-navigation-map" />;
  },
}));

describe('LiveNavigation', () => {
  afterEach(() => {
    cleanup();
    liveNavigationMapMock.mockReset();
    watchPositionMock.mockReset();
    clearWatchMock.mockReset();
    watchSuccessCallback = undefined;
    watchErrorCallback = undefined;
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    Object.defineProperty(window.navigator, 'geolocation', {
      configurable: true,
      value: {
        clearWatch: clearWatchMock,
        getCurrentPosition: vi.fn(),
        watchPosition: watchPositionMock.mockImplementation((success: WatchSuccess, error: WatchError) => {
          watchSuccessCallback = success;
          watchErrorCallback = error;

          return 17;
        }),
      },
    });
  });

  it('requests browser geolocation on mount and announces the pending status politely', () => {
    render(<LiveNavigation />);

    expect(watchPositionMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('status')).toHaveTextContent(/standort wird ermittelt/i);
  });

  it('renders text-first live guidance after the browser reports a position', () => {
    render(<LiveNavigation />);

    watchSuccessCallback?.({
      coords: {
        accuracy: 5,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        latitude: 50.10736,
        longitude: 8.66312,
        speed: null,
      },
      timestamp: Date.now(),
    } as GeolocationPosition);

    expect(
      screen.getByRole('heading', { level: 1, name: /live navigation zu gleis 1/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/aufzug e4/i)).toBeInTheDocument();
    expect(screen.getByText(/gleis 1/i)).toBeInTheDocument();
    expect(liveNavigationMapMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        destinationLabel: 'Gleis 1',
      })
    );
  });

  it('shows manual fallback controls when geolocation permission is denied', async () => {
    const user = userEvent.setup();
    render(<LiveNavigation />);

    watchErrorCallback?.({
      code: 1,
      message: 'Permission denied',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError);

    expect(screen.getByRole('status')).toHaveTextContent(/standortfreigabe wurde abgelehnt/i);
    expect(screen.getByRole('radiogroup', { name: /manuellen startpunkt wählen/i })).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /info point/i }));

    expect(screen.getByText(/startpunkt: info point/i)).toBeInTheDocument();
    expect(screen.getByText(/biegen sie links ab/i)).toBeInTheDocument();
  });

  it('falls back immediately when browser geolocation is unavailable', () => {
    Object.defineProperty(window.navigator, 'geolocation', {
      configurable: true,
      value: undefined,
    });

    render(<LiveNavigation />);

    expect(screen.getByRole('status')).toHaveTextContent(/geolokalisierung ist in diesem browser nicht verfügbar/i);
    expect(screen.getByRole('radiogroup', { name: /manuellen startpunkt wählen/i })).toBeInTheDocument();
  });

  it('clears the geolocation watcher on unmount', () => {
    const view = render(<LiveNavigation />);

    view.unmount();

    expect(clearWatchMock).toHaveBeenCalledWith(17);
  });
});
```

- [ ] **Step 2: Run the page behavior test to verify it fails**

Run:

```bash
rtk vitest run src/pages/LiveNavigation/LiveNavigation.test.tsx
```

Expected: FAIL because the page still renders the placeholder and the new components/props contract do not exist.

- [ ] **Step 3: Write the minimal page, component, and map implementation**

Create `src/pages/LiveNavigation/components/NavigationInstructions.tsx`:

```tsx
type NavigationInstructionsProps = {
  currentLabel: string;
  currentStepDescription: string;
  destinationLabel: string;
  nextLabel: string;
  remainingDistanceMeters: number;
  startLabel: string;
};

export function NavigationInstructions({
  currentLabel,
  currentStepDescription,
  destinationLabel,
  nextLabel,
  remainingDistanceMeters,
  startLabel,
}: NavigationInstructionsProps) {
  return (
    <section aria-labelledby="live-navigation-heading">
      <p>Live Navigation</p>
      <h1 id="live-navigation-heading">Live Navigation zu {destinationLabel}</h1>
      <p>Startpunkt: {startLabel}</p>
      <p>Aktueller Orientierungspunkt: {currentLabel}</p>
      <p>Nächster Schritt: {currentStepDescription}</p>
      <p>Nächstes Ziel: {nextLabel}</p>
      <p>Verbleibende Distanz: ca. {remainingDistanceMeters} Meter</p>
    </section>
  );
}
```

Create `src/pages/LiveNavigation/components/ManualStartSelector.tsx`:

```tsx
import styles from '../LiveNavigation.module.css';
import type { LiveNavigationManualStart } from '../liveNavigationData';

type ManualStartSelectorProps = {
  onChange: (startId: string) => void;
  options: LiveNavigationManualStart[];
  selectedStartId: string | null;
};

export function ManualStartSelector({
  onChange,
  options,
  selectedStartId,
}: ManualStartSelectorProps) {
  return (
    <section aria-labelledby="manual-start-heading" className={styles['manual-start-section']}>
      <h2 id="manual-start-heading">Manuellen Startpunkt wählen</h2>
      <div
        aria-label="Manuellen Startpunkt wählen"
        className={styles['manual-start-options']}
        role="radiogroup"
      >
        {options.map((option) => {
          const checked = option.id === selectedStartId;

          return (
            <label className={styles['manual-start-option']} key={option.id}>
              <input
                checked={checked}
                name="manual-start"
                type="radio"
                onChange={() => onChange(option.id)}
              />
              <span>{option.label}</span>
              <span>{option.description}</span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
```

Modify `src/pages/LiveNavigation/components/LiveNavigationMap.tsx`:

```tsx
import { useEffect, useState } from 'react';
import L, { type LeafletLayer } from 'leaflet';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { ZoomIn, ZoomOut } from 'lucide-react';
import type { LiveNavigationLatLng } from '../liveNavigationData';
import 'leaflet/dist/leaflet.css';
import './live-navigation-markers.css';
import styles from './LiveNavigationMap.module.css';

type LiveNavigationMapProps = {
  currentPosition: LiveNavigationLatLng;
  destinationLabel: string;
  destinationPosition: LiveNavigationLatLng;
  routePath: LiveNavigationLatLng[];
};

function LiveNavigationMapLayers({
  currentPosition,
  destinationLabel,
  destinationPosition,
  routePath,
}: LiveNavigationMapProps) {
  const map = useMap();

  useEffect(() => {
    const layers: LeafletLayer[] = [];

    const routeUnderlay = L.polyline(routePath, {
      color: '#003399',
      lineCap: 'round',
      lineJoin: 'round',
      opacity: 0.2,
      weight: 10,
    }).addTo(map);
    layers.push(routeUnderlay);

    const walkingPath = L.polyline(routePath, {
      color: '#f59e0b',
      dashArray: '10 8',
      lineCap: 'round',
      lineJoin: 'round',
      opacity: 0.9,
      weight: 5,
    }).addTo(map);
    layers.push(walkingPath);

    const currentMarker = L.marker(currentPosition).addTo(map);
    currentMarker.bindTooltip?.('Aktueller Standort', { direction: 'top', offset: [0, -20] });
    layers.push(currentMarker);

    const destinationMarker = L.marker(destinationPosition).addTo(map);
    destinationMarker.bindTooltip?.(destinationLabel, { direction: 'top', offset: [0, -20] });
    layers.push(destinationMarker);

    return () => {
      layers.forEach((layer) => map.removeLayer(layer));
    };
  }, [currentPosition, destinationLabel, destinationPosition, map, routePath]);

  return null;
}

export function LiveNavigationMap(props: LiveNavigationMapProps) {
  const [zoom, setZoom] = useState(17);

  return (
    <div className={styles.wrapper}>
      <MapContainer
        aria-hidden="true"
        center={props.currentPosition}
        className={styles.map}
        scrollWheelZoom
        zoom={zoom}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LiveNavigationMapLayers {...props} />
      </MapContainer>

      <div className={styles.controls} aria-hidden="true">
        <button
          aria-label="Karte vergrößern"
          className={styles['zoom-btn']}
          type="button"
          onClick={() => setZoom((currentZoom) => Math.min(19, currentZoom + 1))}
        >
          <ZoomIn className={styles['zoom-icon']} />
        </button>
        <button
          aria-label="Karte verkleinern"
          className={styles['zoom-btn']}
          type="button"
          onClick={() => setZoom((currentZoom) => Math.max(14, currentZoom - 1))}
        >
          <ZoomOut className={styles['zoom-icon']} />
        </button>
      </div>
    </div>
  );
}
```

Modify `src/pages/LiveNavigation/LiveNavigation.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  LIVE_NAVIGATION_DESTINATION,
  LIVE_NAVIGATION_MANUAL_STARTS,
  LIVE_NAVIGATION_ROUTE_POINTS,
  type LiveNavigationLatLng,
} from './liveNavigationData';
import { NavigationInstructions } from './components/NavigationInstructions';
import { ManualStartSelector } from './components/ManualStartSelector';
import { LiveNavigationMap } from './components/LiveNavigationMap';
import {
  buildInstructionState,
  getRoutePointsFromManualStart,
} from './liveNavigationUtils';
import styles from './LiveNavigation.module.css';

type GeolocationState =
  | 'requesting-location'
  | 'live-tracking'
  | 'location-denied'
  | 'location-unavailable'
  | 'tracking-error'
  | 'manual-start-selected';

const DEFAULT_MANUAL_START_ID = 'main-entrance';

function toLatLng(position: GeolocationPosition): LiveNavigationLatLng {
  return [position.coords.latitude, position.coords.longitude];
}

export default function LiveNavigation() {
  const [geolocationState, setGeolocationState] = useState<GeolocationState>('requesting-location');
  const [livePosition, setLivePosition] = useState<LiveNavigationLatLng | null>(null);
  const [manualStartId, setManualStartId] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeolocationState('location-unavailable');
      setManualStartId(DEFAULT_MANUAL_START_ID);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLivePosition(toLatLng(position));
        setGeolocationState('live-tracking');
      },
      (error) => {
        setGeolocationState(error.code === 1 ? 'location-denied' : 'tracking-error');
        setManualStartId(DEFAULT_MANUAL_START_ID);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const fallbackRoute = getRoutePointsFromManualStart(
    manualStartId ?? DEFAULT_MANUAL_START_ID,
    LIVE_NAVIGATION_MANUAL_STARTS,
    LIVE_NAVIGATION_ROUTE_POINTS
  );
  const activeRoute = livePosition ? LIVE_NAVIGATION_ROUTE_POINTS : fallbackRoute;
  const activePosition = livePosition ?? activeRoute[0].position;
  const activeInstruction = buildInstructionState({
    destination: LIVE_NAVIGATION_DESTINATION,
    position: activePosition,
    routePoints: activeRoute,
  });

  function handleManualStartChange(startId: string) {
    setManualStartId(startId);
    setGeolocationState('manual-start-selected');
  }

  function getStatusMessage() {
    if (geolocationState === 'requesting-location') {
      return 'Standort wird ermittelt.';
    }

    if (geolocationState === 'location-denied') {
      return 'Standortfreigabe wurde abgelehnt. Bitte wählen Sie einen manuellen Startpunkt.';
    }

    if (geolocationState === 'location-unavailable') {
      return 'Geolokalisierung ist in diesem Browser nicht verfügbar. Bitte wählen Sie einen manuellen Startpunkt.';
    }

    if (geolocationState === 'tracking-error') {
      return 'Der Live-Standort konnte nicht aktualisiert werden. Bitte wählen Sie einen manuellen Startpunkt.';
    }

    if (geolocationState === 'manual-start-selected') {
      return 'Manueller Startpunkt aktiv.';
    }

    return 'Live-Standort wird aktualisiert.';
  }

  const shouldShowManualFallback =
    geolocationState === 'location-denied' ||
    geolocationState === 'location-unavailable' ||
    geolocationState === 'tracking-error' ||
    geolocationState === 'manual-start-selected';
  const selectedManualStartLabel =
    LIVE_NAVIGATION_MANUAL_STARTS.find((start) => start.id === (manualStartId ?? DEFAULT_MANUAL_START_ID))
      ?.label ?? 'Haupteingang';

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link aria-label="Zurück zur Routenübersicht" className={styles['header-back']} to="/route-overview">
          Zurück
        </Link>
      </header>

      <section aria-live="polite" className={styles['status-banner']} role="status">
        <p className={styles['status-banner-text']}>{getStatusMessage()}</p>
      </section>

      <div className={styles.layout}>
        <div className={styles['main-col']}>
          <NavigationInstructions
            currentLabel={activeInstruction.currentLabel}
            currentStepDescription={activeInstruction.currentStepDescription}
            destinationLabel={activeInstruction.destinationLabel}
            nextLabel={activeInstruction.nextLabel}
            remainingDistanceMeters={activeInstruction.remainingDistanceMeters}
            startLabel={livePosition ? 'Aktueller Standort' : selectedManualStartLabel}
          />

          {shouldShowManualFallback ? (
            <ManualStartSelector
              options={LIVE_NAVIGATION_MANUAL_STARTS}
              selectedStartId={manualStartId}
              onChange={handleManualStartChange}
            />
          ) : null}
        </div>

        <aside className={styles['panel-col']}>
          <section aria-labelledby="live-navigation-map-heading" className={styles['schematic-card']}>
            <h2 id="live-navigation-map-heading" className={styles['schematic-subtitle']}>
              Live-Karte
            </h2>
            <LiveNavigationMap
              currentPosition={activePosition}
              destinationLabel={LIVE_NAVIGATION_DESTINATION.label}
              destinationPosition={LIVE_NAVIGATION_DESTINATION.position}
              routePath={activeInstruction.routePoints.map((point) => point.position)}
            />
          </section>
        </aside>
      </div>
    </main>
  );
}
```

Append these classes to `src/pages/LiveNavigation/LiveNavigation.module.css`:

```css
.manual-start-section {
  display: grid;
  gap: 12px;
  padding: 16px;
  border-radius: 20px;
  background: var(--color-surface-container-lowest);
  border: 1px solid var(--color-surface-container-high);
  box-shadow: var(--shadow-ambient);
}

.manual-start-options {
  display: grid;
  gap: 10px;
}

.manual-start-option {
  display: grid;
  gap: 4px;
  padding: 14px;
  border: 1px solid var(--color-surface-container-high);
  border-radius: 16px;
  background: var(--color-surface-container-lowest);
}

.manual-start-option:has(input:focus-visible) {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

- [ ] **Step 4: Run the page behavior test to verify it passes**

Run:

```bash
rtk vitest run src/pages/LiveNavigation/LiveNavigation.test.tsx
```

Expected: PASS with all 5 page tests green.

- [ ] **Step 5: Commit the page behavior implementation**

```bash
rtk git add src/pages/LiveNavigation/LiveNavigation.test.tsx src/pages/LiveNavigation/LiveNavigation.tsx src/pages/LiveNavigation/LiveNavigation.module.css src/pages/LiveNavigation/components/NavigationInstructions.tsx src/pages/LiveNavigation/components/ManualStartSelector.tsx src/pages/LiveNavigation/components/LiveNavigationMap.tsx src/pages/LiveNavigation/components/LiveNavigationMap.module.css
rtk git commit -m "feat: add live navigation geolocation fallback"
```

### Task 3: Run Verification and Accessibility Regression Checks

**Files:**
- Verify: `src/pages/LiveNavigation/liveNavigationUtils.test.ts`
- Verify: `src/pages/LiveNavigation/LiveNavigation.test.tsx`
- Verify: `src/pages/LiveNavigation/**/*`
- Verify: `src/routes/live-navigation.tsx`

- [ ] **Step 1: Run the focused Live Navigation test suite**

Run:

```bash
rtk vitest run src/pages/LiveNavigation/liveNavigationUtils.test.ts src/pages/LiveNavigation/LiveNavigation.test.tsx
```

Expected: PASS with the new unit and page coverage green.

- [ ] **Step 2: Run lint and typecheck for the changed surface**

Run:

```bash
rtk npm run lint -- src/pages/LiveNavigation src/routes/live-navigation.tsx
rtk npm run typecheck
```

Expected:

- ESLint reports no errors in the changed files
- TypeScript build completes without type errors

- [ ] **Step 3: Perform the manual accessibility matrix**

Check these behaviors in the browser:

- Tab order reaches the back link, any manual fallback radios, and map zoom buttons in reading order
- `role="status"` announces loading, denial, unsupported, and manual-mode status messages
- Text instructions remain understandable without looking at the map
- Radio selection works with keyboard and updates the visible route copy
- Reduced-motion preference does not introduce required motion to use the feature

- [ ] **Step 4: Commit any verification fixes**

If verification required no code changes, skip this commit. If you changed code during verification, stage only the touched Live Navigation files and commit:

```bash
rtk git add src/pages/LiveNavigation src/routes/live-navigation.tsx
rtk git commit -m "fix: polish live navigation accessibility states"
```

## Self-Review

### Spec Coverage

- Geolocation requested on page load: covered in Task 2 page tests and page implementation.
- `watchPosition` live updates: covered in Task 2 page tests and `LiveNavigation.tsx`.
- Text-first navigation as primary UI: covered in `NavigationInstructions.tsx` and Task 2 assertions.
- Manual fallback for denied, unsupported, or failed tracking: covered in Task 2 tests and page state handling.
- Secondary map fed by props: covered in Task 2 via `LiveNavigationMap.tsx` refactor and mocked prop assertions.
- Future API seam through dedicated data source: covered in Task 1 with `liveNavigationData.ts` and `liveNavigationUtils.ts`.
- Accessibility states and live announcements: covered in Task 2 test assertions and Task 3 manual matrix.

### Placeholder Scan

- No `TODO`, `TBD`, or “implement later” placeholders remain.
- Every code-writing step includes concrete file content or exact snippets.
- Every execution step includes an exact `rtk` command and expected outcome.

### Type Consistency

- Shared lat/lng and route point types live in `liveNavigationData.ts`.
- `LiveNavigationMap` props use the same `LiveNavigationLatLng` tuple type as the data layer.
- The page derives `routePath` from the same route point model used by the utility tests, so route math and rendering stay aligned.
