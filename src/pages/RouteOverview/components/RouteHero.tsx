import { ArrowLeft, BookmarkPlus, Share2 } from 'lucide-react';
import germanMap from '../../../assets/RouteOverview/german.png';
import type { RouteHeroData } from '../types';
import styles from '../RouteOverview.module.css';

type RouteHeroProps = {
  onBack: () => void;
  onSave: () => void;
  route: RouteHeroData;
};

export function RouteHero({ onBack, onSave, route }: RouteHeroProps) {
  return (
    <header className={styles.hero}>
      <div className={styles['hero-toolbar']}>
        <button
          aria-label="Back to home search"
          className={styles['icon-button']}
          type="button"
          onClick={onBack}
        >
          <ArrowLeft aria-hidden="true" />
        </button>

        {route.eyebrow ? <p className={styles.eyebrow}>{route.eyebrow}</p> : null}
      </div>

      <div className={styles['hero-image-wrap']}>
        <img src={germanMap} alt="" className={styles['hero-image']} />

        <svg
          aria-hidden="true"
          className={styles['route-svg']}
          viewBox="0 0 600 700"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
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
            filter="url(#routeGlow)"
          />

          <circle cx="30" cy="360" r="5" fill="#ffffff" filter="url(#routeGlow)" />
          <circle
            className={styles['pulse-ring']}
            cx="30"
            cy="360"
            r="5"
            fill="none"
            stroke="#00ffff"
            strokeWidth="2"
          />

          <circle cx="570" cy="230" r="5" fill="#ffffff" filter="url(#routeGlow)" />
          <circle
            id="berlin-pulse"
            className={styles['pulse-ring']}
            cx="570"
            cy="230"
            r="5"
            fill="none"
            stroke="#00ffff"
            strokeWidth="2"
          />
        </svg>

        <div className={styles['hero-image-actions']}>
          <button aria-label="Share route" className={styles['icon-button']} type="button">
            <Share2 aria-hidden="true" />
          </button>
          <button
            aria-label="Save route"
            className={styles['icon-button']}
            type="button"
            onClick={onSave}
          >
            <BookmarkPlus aria-hidden="true" />
          </button>
        </div>

        <div className={styles['hero-route-card']} aria-hidden="true">
          <div className={styles['hero-stop']}>
            <p className={styles['hero-stop-label']}>{route.departure.label}</p>
            <strong className={styles['hero-stop-time']}>{route.departure.time}</strong>
            <span className={styles['hero-stop-station']}>{route.departure.station}</span>
          </div>

          <div className={styles['hero-divider']}>
            <div className={styles['hero-divider-line']} />
            <span className={styles['hero-duration']}>{route.duration}</span>
          </div>

          <div className={`${styles['hero-stop']} ${styles['hero-stop-right']}`}>
            <p className={styles['hero-stop-label']}>{route.arrival.label}</p>
            <strong className={styles['hero-stop-time']}>{route.arrival.time}</strong>
            <span className={styles['hero-stop-station']}>{route.arrival.station}</span>
          </div>
        </div>
      </div>

      {route.eyebrow ? (
        <div className={styles['hero-meta']}>
          <div className={styles['hero-badges']}>
            <span className={styles['badge-primary']}>{route.eyebrow}</span>
          </div>
        </div>
      ) : null}
    </header>
  );
}
