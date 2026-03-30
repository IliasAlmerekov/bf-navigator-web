import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Map, Navigation } from 'lucide-react';
import { ROUTE_HERO, ROUTE_HIGHLIGHTS, ROUTE_STATION_SERVICES, ROUTE_TIMELINE } from './constants';
import { JourneyTimeline } from './components/JourneyTimeline';
import { RouteHero } from './components/RouteHero';
import { RouteSupportAside } from './components/RouteSupportAside';
import styles from './RouteOverview.module.css';

export default function RouteOverview() {
  const navigate = useNavigate();
  const [isRouteSaved, setIsRouteSaved] = useState(false);

  function handleBack() {
    void navigate({ to: '/' });
  }

  function handleSave() {
    setIsRouteSaved((current) => !current);
  }

  return (
    <main className={styles.page}>
      <RouteHero route={ROUTE_HERO} onBack={handleBack} onSave={handleSave} />

      <p aria-live="polite" className={styles['status-announcement']}>
        {isRouteSaved
          ? 'Route saved to your trips.'
          : 'Route not saved yet. Use the save action to keep it for later.'}
      </p>

      <div className={styles.layout}>
        <section aria-labelledby="detailed-timeline-heading" className={styles['timeline-section']}>
          <header className={styles['timeline-header']}>
            <h1 id="detailed-timeline-heading" className={styles['card-title']}>
              Detailed Timeline
            </h1>
            <div className={styles['header-badges']}>
              <span className={styles['badge-on-time']}>On time</span>
              <span className={styles['badge-train']}>ICE772</span>
            </div>
          </header>

          <JourneyTimeline items={ROUTE_TIMELINE} />

          <div className={styles['action-row']}>
            <Link className={styles['action-button']} to="/route-details">
              <Map aria-hidden="true" className={styles['action-icon']} />
              <span>View Full Route Map</span>
            </Link>
            <Link className={styles['action-button']} to="/alternative-routes">
              <Navigation aria-hidden="true" className={styles['action-icon']} />
              <span>View Alternatives</span>
            </Link>
          </div>
        </section>

        <div className={styles['detail-column']}>
          <RouteSupportAside
            highlights={ROUTE_HIGHLIGHTS}
            onSave={handleSave}
            stationServices={ROUTE_STATION_SERVICES}
          />
        </div>
      </div>
    </main>
  );
}
