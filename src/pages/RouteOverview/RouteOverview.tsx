import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { AlertTriangle } from 'lucide-react';
import { ROUTE_HERO, ROUTE_STATION_SERVICES, ROUTE_TIMELINE } from './constants';
import { JourneyTimeline } from './components/JourneyTimeline';
import { MapNavigationCard } from './components/MapNavigationCard';
import { RouteHero } from './components/RouteHero';
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

          <section
            aria-labelledby="station-services-heading"
            className={styles['station-services-below']}
          >
            <h2 id="station-services-heading">Station services</h2>

            <ul className={styles['station-services-station-list']} role="list">
              {ROUTE_STATION_SERVICES.map((station) => (
                <li key={station.stationId}>
                  <article className={styles['station-service-card']}>
                    <h3 className={styles['station-service-station-name']}>
                      {station.stationName}
                    </h3>

                    {station.elevatorsStatus !== 'available' && (
                      <p className={styles['station-warning-row']}>
                        <AlertTriangle aria-hidden="true" />
                        <span>
                          {'Lift out of service'}
                          {station.elevatorsGleis ? ` \u2014 ${station.elevatorsGleis}` : ''}
                        </span>
                      </p>
                    )}

                    <ul className={styles['station-services-list']} role="list">
                      {station.amenities.map((amenity) => {
                        const AmenityIcon = amenity.icon;
                        const chipLabel =
                          amenity.serviceStatus === 'unavailable' && amenity.gleis
                            ? `${amenity.label} \u2014 ${amenity.gleis}`
                            : amenity.label;
                        return (
                          <li
                            className={styles['station-service-chip']}
                            data-status={amenity.serviceStatus ?? 'available'}
                            key={`${station.stationId}-${amenity.label}`}
                          >
                            <span aria-hidden="true" className={styles['station-service-dot']} />
                            <AmenityIcon
                              aria-hidden="true"
                              className={styles['station-service-icon']}
                            />
                            <span>{chipLabel}</span>
                            {amenity.serviceStatus === 'unavailable' && (
                              <span className={styles['sr-only']}>(unavailable)</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className={styles['detail-column']}>
          <MapNavigationCard />
        </div>
      </div>
    </main>
  );
}
