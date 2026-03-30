import { BookmarkPlus } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import type { RouteHighlight, WeatherSnapshot } from '../types';
import styles from '../RouteOverview.module.css';

type RouteSupportAsideProps = {
  highlights: RouteHighlight[];
  onSave: () => void;
  weather: WeatherSnapshot;
};

export function RouteSupportAside({ highlights, onSave, weather }: RouteSupportAsideProps) {
  const WeatherIcon = weather.icon;

  return (
    <aside className={styles.aside}>
      <section aria-labelledby="journey-highlights-heading" className={styles.section}>
        <div className={styles['section-heading']}>
          <p className={styles['section-kicker']}>Journey highlights</p>
          <h2 id="journey-highlights-heading">Fast context beyond the raw timetable.</h2>
        </div>

        <ul className={styles['highlight-list']} role="list">
          {highlights.map((highlight) => {
            const HighlightIcon = highlight.icon;

            return (
              <li key={highlight.title}>
                <article className={styles['highlight-card']}>
                  <span className={styles['highlight-icon-wrap']}>
                    <HighlightIcon aria-hidden="true" className={styles['highlight-icon']} />
                  </span>
                  <div>
                    <h3>{highlight.title}</h3>
                    <p>{highlight.description}</p>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="destination-weather-heading" className={styles.section}>
        <div className={styles['section-heading']}>
          <p className={styles['section-kicker']}>Destination weather</p>
          <h2 id="destination-weather-heading">
            {weather.station}, {weather.time}
          </h2>
        </div>

        <article className={styles['weather-card']}>
          <span className={styles['weather-icon-wrap']}>
            <WeatherIcon aria-hidden="true" className={styles['weather-icon']} />
          </span>
          <strong>{weather.temperature}</strong>
          <p>{weather.condition}</p>
        </article>
      </section>

      <section aria-labelledby="route-actions-heading" className={styles.section}>
        <div className={styles['section-heading']}>
          <p className={styles['section-kicker']}>Next step</p>
          <h2 id="route-actions-heading">Keep moving without leaving this route context.</h2>
        </div>

        <div className={styles['action-stack']}>
          <Link className={styles['primary-link']} to="/route-details">
            View full route
          </Link>
          <button className={styles['secondary-button']} type="button" onClick={onSave}>
            <BookmarkPlus aria-hidden="true" />
            <span>Save route</span>
          </button>
          <Link className={styles['tertiary-link']} to="/alternative-routes">
            View alternatives
          </Link>
        </div>
      </section>
    </aside>
  );
}
