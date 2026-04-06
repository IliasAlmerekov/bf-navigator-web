import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Navigation, ZoomIn, ZoomOut } from 'lucide-react';
import { ROUTE_OVERVIEW_MAP_DATA } from '../mapData';
import type { RouteMapData } from '../types';
import { RouteMapCanvas } from './RouteMapCanvas';
import styles from '../RouteOverview.module.css';

type MapNavigationCardProps = {
  mapData?: RouteMapData;
};

export function MapNavigationCard({ mapData = ROUTE_OVERVIEW_MAP_DATA }: MapNavigationCardProps) {
  const [zoom, setZoom] = useState(mapData.zoom);
  const facilityMarkers = mapData.markers.filter(
    (marker) => marker.kind === 'facility' && marker.status !== 'available'
  );

  function handleZoomChange(delta: number) {
    setZoom((currentZoom) =>
      Math.min(mapData.maxZoom, Math.max(mapData.minZoom, currentZoom + delta))
    );
  }

  return (
    <section
      aria-describedby="route-map-hint route-map-attribution"
      aria-labelledby="route-map-heading"
      className={styles['map-nav-card']}
    >
      <div className={styles['map-nav-header']}>
        <p className={styles['map-nav-kicker']}>Routenvorschau</p>
        <h2 className={styles['map-nav-heading']} id="route-map-heading">
          Live-Karte
        </h2>
        <p className={styles['map-nav-hint']} id="route-map-hint">
          Mit Maus oder einem Finger ziehen. Zum Zoomen Mausrad oder Pinch-Geste nutzen.
        </p>
      </div>

      <div className={styles['map-nav-map-wrap']}>
        <RouteMapCanvas mapData={mapData} zoom={zoom} />

        <div className={styles['map-nav-controls']}>
          <button
            aria-label="Routenvorschau vergrößern"
            className={styles['map-nav-zoom-btn']}
            disabled={zoom >= mapData.maxZoom}
            type="button"
            onClick={() => handleZoomChange(1)}
          >
            <ZoomIn className={styles['map-nav-zoom-icon']} />
          </button>
          <button
            aria-label="Routenvorschau verkleinern"
            className={styles['map-nav-zoom-btn']}
            disabled={zoom <= mapData.minZoom}
            type="button"
            onClick={() => handleZoomChange(-1)}
          >
            <ZoomOut className={styles['map-nav-zoom-icon']} />
          </button>
        </div>
      </div>

      <ul aria-label="Vorgemerkte Anlagen" className={styles['map-nav-facilities']} role="list">
        {facilityMarkers.map((marker) => (
          <li className={styles['map-nav-facility-item']} key={marker.id}>
            <span
              aria-hidden="true"
              className={styles['map-nav-facility-status']}
              data-status={marker.status}
            />
            <div className={styles['map-nav-facility-copy']}>
              <span className={styles['map-nav-facility-title']}>{marker.label}</span>
              {marker.locationDetail ? (
                <span className={styles['map-nav-facility-description']}>
                  {marker.locationDetail}
                </span>
              ) : null}
              {marker.statusLabel ? (
                <span className={styles['map-nav-facility-state']}>{marker.statusLabel}</span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <p className={styles['map-nav-attribution']} id="route-map-attribution">
        Kartendaten © OpenStreetMap-Mitwirkende
      </p>

      <Link to="/live-navigation" className={styles['live-nav-button']}>
        <Navigation aria-hidden="true" />
        <span>Live-Navigation</span>
      </Link>
    </section>
  );
}
