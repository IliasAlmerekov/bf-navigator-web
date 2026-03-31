import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ROUTE_HERO, ROUTE_STATION_SERVICES_PANEL, ROUTE_TIMELINE } from './constants';
import { JourneyTimeline } from './components/JourneyTimeline';
import { MapNavigationCard } from './components/MapNavigationCard';
import { RouteHero } from './components/RouteHero';
import { StationServicesPanel } from './components/StationServicesPanel';
import styles from './RouteOverview.module.css';

export default function RouteOverview() {
  const [isRouteSaved, setIsRouteSaved] = useState(false);
  const [savedAnnouncement, setSavedAnnouncement] = useState('');

  function handleSave() {
    setIsRouteSaved((current) => {
      const next = !current;
      setSavedAnnouncement(next ? 'Route saved to your trips.' : 'Route removed from your trips.');
      return next;
    });
  }

  return (
    <main className={styles.page}>
      <RouteHero isSaved={isRouteSaved} route={ROUTE_HERO} onSave={handleSave} />

      <p aria-live="polite" className={styles['status-announcement']}>
        {savedAnnouncement}
      </p>

      <div className={styles.layout}>
        <div className={styles['timeline-column']}>
          <section
            aria-labelledby="detailed-timeline-heading"
            className={styles['timeline-section']}
          >
            <header className={styles['timeline-header']}>
              <h2 id="detailed-timeline-heading" className={styles['card-title']}>
                Detailed Timeline
              </h2>
              <div className={styles['header-badges']}>
                <span className={styles['badge-on-time']}>On time</span>
                <span className={styles['badge-train']}>ICE772</span>
              </div>
            </header>

            <JourneyTimeline items={ROUTE_TIMELINE} />

            <div className={styles['action-row']}>
              <Link
                className={styles['action-button']}
                to="/train-search-results"
                search={{
                  originEva: '',
                  originName: '',
                  destinationEva: '',
                  destinationName: '',
                  date: '',
                  time: '',
                }}
                aria-label="Return to search results"
              >
                <span>View Alternatives</span>
              </Link>
            </div>
          </section>

          <StationServicesPanel panel={ROUTE_STATION_SERVICES_PANEL} />
        </div>

        <div className={styles['detail-column']}>
          <MapNavigationCard />
        </div>
      </div>
    </main>
  );
}
