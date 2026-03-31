import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Navigation, ZoomIn, ZoomOut } from 'lucide-react';
import { ROUTE_OVERVIEW_MAP_DATA } from '../mapData';
import { RouteMapCanvas } from './RouteMapCanvas';
import styles from '../RouteOverview.module.css';

export function MapNavigationCard() {
  const [zoom, setZoom] = useState(ROUTE_OVERVIEW_MAP_DATA.zoom);
  const facilityMarkers = ROUTE_OVERVIEW_MAP_DATA.markers.filter(
    (marker) => marker.kind === 'facility'
  );

  function handleZoomChange(delta: number) {
    setZoom((currentZoom) =>
      Math.min(
        ROUTE_OVERVIEW_MAP_DATA.maxZoom,
        Math.max(ROUTE_OVERVIEW_MAP_DATA.minZoom, currentZoom + delta)
      )
    );
  }

  return (
    <section
      aria-describedby="route-map-copy route-map-attribution"
      aria-labelledby="route-map-heading"
      className={styles['map-nav-card']}
    >
      <div className={styles['map-nav-header']}>
        <p className={styles['map-nav-kicker']}>Route preview</p>
        <h2 className={styles['map-nav-heading']} id="route-map-heading">
          Live map ready for backend coordinates
        </h2>
        <p className={styles['map-nav-copy']} id="route-map-copy">
          The map uses a dedicated route DTO, so station and facility coordinates can later come
          directly from the backend without changing the UI layer.
        </p>
        <p className={styles['map-nav-hint']}>
          Drag with mouse or one finger. Use the wheel or pinch gesture to zoom.
        </p>
      </div>

      <div className={styles['map-nav-map-wrap']}>
        <RouteMapCanvas mapData={ROUTE_OVERVIEW_MAP_DATA} zoom={zoom} />

        <div className={styles['map-nav-controls']}>
          <button
            aria-label="Zoom in route preview"
            className={styles['map-nav-zoom-btn']}
            disabled={zoom >= ROUTE_OVERVIEW_MAP_DATA.maxZoom}
            type="button"
            onClick={() => handleZoomChange(1)}
          >
            <ZoomIn className={styles['map-nav-zoom-icon']} />
          </button>
          <button
            aria-label="Zoom out route preview"
            className={styles['map-nav-zoom-btn']}
            disabled={zoom <= ROUTE_OVERVIEW_MAP_DATA.minZoom}
            type="button"
            onClick={() => handleZoomChange(-1)}
          >
            <ZoomOut className={styles['map-nav-zoom-icon']} />
          </button>
        </div>
      </div>

      <ul
        aria-label="Mapped facilities preview"
        className={styles['map-nav-facilities']}
        role="list"
      >
        {facilityMarkers.map((marker) => (
          <li className={styles['map-nav-facility-item']} key={marker.id}>
            <span
              aria-hidden="true"
              className={styles['map-nav-facility-status']}
              data-status={marker.status}
            />
            <div className={styles['map-nav-facility-copy']}>
              <span className={styles['map-nav-facility-title']}>{marker.label}</span>
              <span className={styles['map-nav-facility-description']}>{marker.description}</span>
            </div>
          </li>
        ))}
      </ul>

      <p className={styles['map-nav-attribution']} id="route-map-attribution">
        Map data © OpenStreetMap contributors
      </p>

      <Link to="/live-navigation" className={styles['live-nav-button']}>
        <Navigation aria-hidden="true" />
        <span>Live Navigation</span>
      </Link>
    </section>
  );
}
