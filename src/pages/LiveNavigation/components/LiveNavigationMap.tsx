import { useEffect, useState } from 'react';
import L, { type LeafletLayer } from 'leaflet';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { ZoomIn, ZoomOut } from 'lucide-react';
import type { LiveNavigationLatLng } from '../liveNavigationData';
import type { LiveNavigationMapMarker } from '../liveNavigationUtils';
import 'leaflet/dist/leaflet.css';
import './live-navigation-markers.css';
import styles from './LiveNavigationMap.module.css';

type LiveNavigationMapProps = {
  currentPosition: LiveNavigationLatLng;
  destinationLabel: string;
  destinationPosition: LiveNavigationLatLng;
  markers?: LiveNavigationMapMarker[];
  nextLabel: string;
  routePath: LiveNavigationLatLng[];
};

const INITIAL_ZOOM = 17;
const MIN_ZOOM = 14;
const MAX_ZOOM = 19;

const PULSING_ICON_HTML = `
  <div class="live-nav-pulse-outer">
    <div class="live-nav-pulse-inner"></div>
  </div>
`;

const MARKER_CLASS_BY_KIND: Record<LiveNavigationMapMarker['kind'], string> = {
  'active-elevator': 'live-nav-dest-marker',
  departure: 'live-nav-platform-marker',
  entrance: 'live-nav-platform-marker',
  escalator: 'live-nav-dest-marker',
  'inactive-elevator': 'live-nav-platform-marker',
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getMarkerShortLabel(label: string) {
  const match = label.match(/([A-Z]\d+|\d+)/);

  return match?.[1] ?? label.slice(0, 2).toUpperCase();
}

function createMarkerIcon(className: string, label: string, size: number, anchor: number) {
  return L.divIcon({
    className: '',
    html: `
      <div class="${className}">
        <span>${label}</span>
      </div>
    `,
    iconAnchor: [anchor, anchor],
    iconSize: [size, size],
  });
}

function getViewportPoints({
  currentPosition,
  destinationPosition,
  markers,
  routePath,
}: Pick<
  LiveNavigationMapProps,
  'currentPosition' | 'destinationPosition' | 'markers' | 'routePath'
>) {
  const positions = [
    currentPosition,
    destinationPosition,
    ...routePath,
    ...(markers?.map((marker) => marker.position) ?? []),
  ];

  return Array.from(
    new Map(positions.map((position) => [`${position[0]}:${position[1]}`, position])).values()
  );
}

function MapViewportController({
  currentPosition,
  destinationPosition,
  markers,
  routePath,
  zoom,
}: LiveNavigationMapProps & { zoom: number }) {
  const map = useMap();

  useEffect(() => {
    const viewportPoints = getViewportPoints({
      currentPosition,
      destinationPosition,
      markers,
      routePath,
    });

    if (viewportPoints.length === 0) {
      return;
    }

    if (viewportPoints.length === 1) {
      map.setView(viewportPoints[0], zoom, { animate: false });
      return;
    }

    const bounds = L.latLngBounds(viewportPoints);

    if (!bounds.isValid()) {
      return;
    }

    map.fitBounds(bounds, {
      animate: false,
      maxZoom: zoom,
      padding: [32, 32],
    });
  }, [currentPosition, destinationPosition, map, markers, routePath, zoom]);

  return null;
}

function MapAccessibilityGuard() {
  const map = useMap();

  useEffect(() => {
    map.keyboard.disable();
  }, [map]);

  return null;
}

function LiveNavigationMapLayers({
  currentPosition,
  destinationLabel,
  destinationPosition,
  markers,
  nextLabel,
  routePath,
}: LiveNavigationMapProps) {
  const map = useMap();

  useEffect(() => {
    const layers: LeafletLayer[] = [];

    const routeUnderlay = L.polyline(routePath, {
      color: '#039',
      lineCap: 'round',
      lineJoin: 'round',
      opacity: 0.2,
      weight: 10,
    }).addTo(map);
    layers.push(routeUnderlay);

    const walkingPath = L.polyline(routePath, {
      color: '#b45309',
      dashArray: '10 8',
      lineCap: 'round',
      lineJoin: 'round',
      opacity: 0.9,
      weight: 5,
    }).addTo(map);
    layers.push(walkingPath);

    const pulsingIcon = L.divIcon({
      className: '',
      html: PULSING_ICON_HTML,
      iconAnchor: [18, 18],
      iconSize: [36, 36],
    });
    const currentMarker = L.marker(currentPosition, { icon: pulsingIcon }).addTo(map);
    currentMarker.bindTooltip?.('Aktueller Standort', { direction: 'top', offset: [0, -20] });
    layers.push(currentMarker);

    if (markers?.length) {
      markers.forEach((marker) => {
        const leafletMarker = L.marker(marker.position, {
          icon: createMarkerIcon(
            MARKER_CLASS_BY_KIND[marker.kind],
            escapeHtml(getMarkerShortLabel(marker.label)),
            marker.kind === 'departure' ? 32 : 40,
            marker.kind === 'departure' ? 16 : 20
          ),
        }).addTo(map);
        leafletMarker.bindTooltip?.(escapeHtml(marker.accessibleLabel), {
          direction: 'top',
          offset: [0, -24],
        });
        layers.push(leafletMarker);
      });
    } else {
      const nextPosition = routePath[1] ?? destinationPosition;
      const nextMarker = L.marker(nextPosition, {
        icon: createMarkerIcon(
          'live-nav-dest-marker',
          escapeHtml(getMarkerShortLabel(nextLabel)),
          40,
          20
        ),
      }).addTo(map);
      nextMarker.bindTooltip?.(escapeHtml(nextLabel), { direction: 'top', offset: [0, -24] });
      layers.push(nextMarker);

      const destinationMarker = L.marker(destinationPosition, {
        icon: createMarkerIcon(
          'live-nav-platform-marker',
          escapeHtml(getMarkerShortLabel(destinationLabel)),
          32,
          16
        ),
      }).addTo(map);
      destinationMarker.bindTooltip?.(escapeHtml(destinationLabel), {
        direction: 'top',
        offset: [0, -20],
      });
      layers.push(destinationMarker);
    }

    return () => {
      layers.forEach((layer) => map.removeLayer(layer));
    };
  }, [currentPosition, destinationLabel, destinationPosition, map, markers, nextLabel, routePath]);

  return null;
}

export function LiveNavigationMap(props: LiveNavigationMapProps) {
  const [zoom, setZoom] = useState(INITIAL_ZOOM);

  function handleZoom(delta: number) {
    setZoom((currentZoom) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, currentZoom + delta)));
  }

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
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapAccessibilityGuard />
        <MapViewportController {...props} zoom={zoom} />
        <LiveNavigationMapLayers {...props} />
      </MapContainer>

      <div className={styles.controls}>
        <button
          aria-label="Karte vergrößern"
          className={styles['zoom-btn']}
          disabled={zoom >= MAX_ZOOM}
          type="button"
          onClick={() => handleZoom(1)}
        >
          <ZoomIn aria-hidden="true" className={styles['zoom-icon']} />
        </button>
        <button
          aria-label="Karte verkleinern"
          className={styles['zoom-btn']}
          disabled={zoom <= MIN_ZOOM}
          type="button"
          onClick={() => handleZoom(-1)}
        >
          <ZoomOut aria-hidden="true" className={styles['zoom-icon']} />
        </button>
      </div>

      <div aria-hidden="true" className={styles.legend}>
        <span className={styles['legend-item']} data-kind="current">
          <span className={styles['legend-dot']} />
          Standort
        </span>
        <span className={styles['legend-item']} data-kind="elevator">
          <span className={styles['legend-dot']} />
          {props.nextLabel}
        </span>
        <span className={styles['legend-item']} data-kind="platform">
          <span className={styles['legend-dot']} />
          {props.destinationLabel}
        </span>
      </div>
    </div>
  );
}
