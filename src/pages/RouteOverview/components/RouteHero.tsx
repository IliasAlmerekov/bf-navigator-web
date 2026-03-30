import { ArrowLeft, BookmarkPlus, Share2 } from 'lucide-react';
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

        <p className={styles.eyebrow}>{route.eyebrow}</p>

        <div className={styles['hero-toolbar-actions']}>
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
      </div>

      <div className={styles['hero-surface']}>
        <div className={styles['hero-copy']}>
          <span className={styles['route-pill']}>ICE 772 direct</span>
          <h1>{route.title}</h1>
          <p className={styles.lead}>{route.summary}</p>

          <dl className={styles.metrics} aria-label="Route snapshot">
            <div className={styles.metric}>
              <dt>Duration</dt>
              <dd>{route.duration}</dd>
            </div>
            <div className={styles.metric}>
              <dt>Transfers</dt>
              <dd>{route.transfers}</dd>
            </div>
            <div className={styles.metric} data-tone="accent">
              <dt>Accessibility confidence</dt>
              <dd>{route.confidence}</dd>
            </div>
          </dl>
        </div>

        <div aria-hidden="true" className={styles['hero-visual']}>
          <div className={styles['hero-visual-glow']} />
          <div className={styles['hero-visual-card']}>
            <span>Step-free corridor</span>
            <strong>Frankfurt → Kassel → Berlin</strong>
            <div className={styles['hero-visual-line']} />
            <small>Live lifts checked before each transfer</small>
          </div>
        </div>
      </div>

      <div className={styles['stop-grid']}>
        <article className={styles['stop-card']}>
          <p>{route.departure.label}</p>
          <strong>{route.departure.time}</strong>
          <span>{route.departure.station}</span>
          <small>{route.departure.platform}</small>
        </article>

        <article
          className={styles['route-bridge']}
          aria-label={`${route.duration}, ${route.transfers}`}
        >
          <span>{route.duration}</span>
          <small>{route.transfers}</small>
        </article>

        <article className={styles['stop-card']}>
          <p>{route.arrival.label}</p>
          <strong>{route.arrival.time}</strong>
          <span>{route.arrival.station}</span>
          <small>{route.arrival.platform}</small>
        </article>
      </div>
    </header>
  );
}
