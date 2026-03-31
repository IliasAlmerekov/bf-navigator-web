import { Link } from '@tanstack/react-router';
import { Navigation, ZoomIn, ZoomOut } from 'lucide-react';
import germanMap from '../../../assets/RouteOverview/german.png';
import styles from '../RouteOverview.module.css';

export function MapNavigationCard() {
  return (
    <div className={styles['map-nav-card']}>
      <div className={styles['map-nav-map-wrap']}>
        <img src={germanMap} alt="" className={styles['hero-image']} />

        <svg
          aria-hidden="true"
          className={styles['route-svg']}
          viewBox="0 0 600 700"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="mapNavRouteGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            className={styles['route-line']}
            d="M 30 360 Q 300 180 570 230"
            fill="none"
            stroke="#00ffff"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#mapNavRouteGlow)"
          />

          <circle cx="30" cy="360" r="5" fill="#ffffff" filter="url(#mapNavRouteGlow)" />
          <circle
            className={styles['pulse-ring']}
            cx="30"
            cy="360"
            r="5"
            fill="none"
            stroke="#00ffff"
            strokeWidth="2"
          />

          <circle cx="570" cy="230" r="5" fill="#ffffff" filter="url(#mapNavRouteGlow)" />
          <circle
            id="map-nav-berlin-pulse"
            className={styles['pulse-ring']}
            cx="570"
            cy="230"
            r="5"
            fill="none"
            stroke="#00ffff"
            strokeWidth="2"
          />
        </svg>

        <div className={styles['map-nav-controls']}>
          <span aria-hidden="true" className={styles['map-nav-zoom-btn']}>
            <ZoomIn className={styles['map-nav-zoom-icon']} />
          </span>
          <span aria-hidden="true" className={styles['map-nav-zoom-btn']}>
            <ZoomOut className={styles['map-nav-zoom-icon']} />
          </span>
        </div>
      </div>

      <Link to="/live-navigation" className={styles['live-nav-button']}>
        <Navigation aria-hidden="true" />
        <span>Live Navigation</span>
      </Link>
    </div>
  );
}
