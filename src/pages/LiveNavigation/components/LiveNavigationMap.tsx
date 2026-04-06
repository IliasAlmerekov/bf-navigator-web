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

function LiveNavigationMapViewport({
  currentPosition,
  zoom,
}: {
  currentPosition: LiveNavigationLatLng;
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(currentPosition, zoom, { animate: false });
  }, [currentPosition, map, zoom]);

  return null;
}

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
        <LiveNavigationMapViewport currentPosition={props.currentPosition} zoom={zoom} />
        <LiveNavigationMapLayers {...props} />
      </MapContainer>

      <div className={styles.controls}>
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
