import { useEffect, useState } from 'react';
import L, { type LeafletLayer } from 'leaflet';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { ZoomIn, ZoomOut } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './live-navigation-markers.css';
import styles from './LiveNavigationMap.module.css';

// Frankfurt (Main) Hbf — real coordinates
const CURRENT_POSITION: [number, number] = [50.1069, 8.6634];
const ELEVATOR_E4: [number, number] = [50.1073, 8.6631];
const PLATFORM_7: [number, number] = [50.1077, 8.6629];

const INITIAL_ZOOM = 17;
const MIN_ZOOM = 14;
const MAX_ZOOM = 19;

const WALKING_PATH: [number, number][] = [
  CURRENT_POSITION,
  [50.107, 8.6633],
  [50.1071, 8.6632],
  ELEVATOR_E4,
  [50.1075, 8.663],
  PLATFORM_7,
];

const PULSING_ICON_HTML = `
  <div class="live-nav-pulse-outer">
    <div class="live-nav-pulse-inner"></div>
  </div>
`;

const DESTINATION_ICON_HTML = `
  <div class="live-nav-dest-marker">
    <span>E4</span>
  </div>
`;

const PLATFORM_ICON_HTML = `
  <div class="live-nav-platform-marker">
    <span>7</span>
  </div>
`;

// Syncs external zoom state to the map while preserving the current pan position
function MapZoomController({ zoom }: { zoom: number }) {
  const map = useMap();

  useEffect(() => {
    const center = map.getCenter();
    map.setView(center, zoom, { animate: false });
  }, [map, zoom]);

  return null;
}

function LiveNavigationMapLayers() {
  const map = useMap();

  useEffect(() => {
    const layers: LeafletLayer[] = [];

    // Solid blue route underlay
    const routeUnderlay = L.polyline(WALKING_PATH, {
      color: '#039',
      lineCap: 'round',
      lineJoin: 'round',
      opacity: 0.2,
      weight: 10,
    }).addTo(map);
    layers.push(routeUnderlay);

    // Tactile walking path (yellow dashed)
    const walkingPath = L.polyline(WALKING_PATH, {
      color: '#f59e0b',
      dashArray: '10 8',
      lineCap: 'round',
      lineJoin: 'round',
      opacity: 0.9,
      weight: 5,
    }).addTo(map);
    layers.push(walkingPath);

    // Pulsing current position marker
    const pulsingIcon = L.divIcon({
      className: '',
      html: PULSING_ICON_HTML,
      iconAnchor: [18, 18],
      iconSize: [36, 36],
    });
    const currentMarker = L.marker(CURRENT_POSITION, { icon: pulsingIcon }).addTo(map);
    currentMarker.bindTooltip?.('Aktueller Standort', { direction: 'top', offset: [0, -20] });
    layers.push(currentMarker);

    // Elevator E4 marker
    const elevatorIcon = L.divIcon({
      className: '',
      html: DESTINATION_ICON_HTML,
      iconAnchor: [20, 20],
      iconSize: [40, 40],
    });
    const elevatorMarker = L.marker(ELEVATOR_E4, { icon: elevatorIcon }).addTo(map);
    elevatorMarker.bindTooltip?.('Aufzug E4', { direction: 'top', offset: [0, -24] });
    layers.push(elevatorMarker);

    // Platform 7 marker
    const platformIcon = L.divIcon({
      className: '',
      html: PLATFORM_ICON_HTML,
      iconAnchor: [16, 16],
      iconSize: [32, 32],
    });
    const platformMarker = L.marker(PLATFORM_7, { icon: platformIcon }).addTo(map);
    platformMarker.bindTooltip?.('Gleis 7', { direction: 'top', offset: [0, -20] });
    layers.push(platformMarker);

    return () => {
      layers.forEach((layer) => map.removeLayer(layer));
    };
  }, [map]);

  return null;
}

export function LiveNavigationMap() {
  const [zoom, setZoom] = useState(INITIAL_ZOOM);

  function handleZoom(delta: number) {
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta)));
  }

  return (
    <div className={styles.wrapper}>
      <MapContainer
        aria-hidden="true"
        center={CURRENT_POSITION}
        className={styles.map}
        scrollWheelZoom
        zoom={zoom}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapZoomController zoom={zoom} />
        <LiveNavigationMapLayers />
      </MapContainer>

      {/* Zoom controls */}
      <div className={styles.controls} aria-hidden="true">
        <button
          aria-label="Karte vergrößern"
          className={styles['zoom-btn']}
          disabled={zoom >= MAX_ZOOM}
          type="button"
          onClick={() => handleZoom(1)}
        >
          <ZoomIn className={styles['zoom-icon']} />
        </button>
        <button
          aria-label="Karte verkleinern"
          className={styles['zoom-btn']}
          disabled={zoom <= MIN_ZOOM}
          type="button"
          onClick={() => handleZoom(-1)}
        >
          <ZoomOut className={styles['zoom-icon']} />
        </button>
      </div>

      {/* Legend overlay */}
      <div aria-hidden="true" className={styles.legend}>
        <span className={styles['legend-item']} data-kind="current">
          <span className={styles['legend-dot']} />
          Standort
        </span>
        <span className={styles['legend-item']} data-kind="elevator">
          <span className={styles['legend-dot']} />
          Aufzug E4
        </span>
        <span className={styles['legend-item']} data-kind="platform">
          <span className={styles['legend-dot']} />
          Gleis 7
        </span>
      </div>
    </div>
  );
}
