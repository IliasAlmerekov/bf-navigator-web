import { BookmarkPlus } from 'lucide-react';
import type { RouteHighlight, StationServiceStatus } from '../types';
import styles from '../RouteOverview.module.css';

type RouteSupportAsideProps = {
  highlights: RouteHighlight[];
  onSave: () => void;
  stationServices: StationServiceStatus[];
};

function getElevatorStatusLabel(status: StationServiceStatus['elevatorsStatus']) {
  switch (status) {
    case 'available':
      return 'Elevators available';
    case 'limited':
      return 'Elevators limited';
    case 'out_of_service':
      return 'Elevators out of service';
    default:
      return 'Elevators status unavailable';
  }
}

export function RouteSupportAside({ highlights, onSave, stationServices }: RouteSupportAsideProps) {
  return (
    <aside className={styles.aside}>
      <section aria-labelledby="journey-highlights-heading" className={styles['highlight-section']}>
        <div className={styles['section-heading']}>
          <p className={styles['section-kicker']}>Journey highlights</p>
          <h2 id="journey-highlights-heading">Journey highlights</h2>
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

        <div className={styles['action-stack']}>
          <button className={styles['secondary-button']} type="button" onClick={onSave}>
            <BookmarkPlus aria-hidden="true" />
            <span>Save to My Routes</span>
          </button>
        </div>
      </section>

      <section
        aria-labelledby="station-services-heading"
        className={styles['station-services-section']}
      >
        <div className={styles['section-heading']}>
          <p className={styles['section-kicker']}>Station services</p>
          <h2 id="station-services-heading">Station services</h2>
        </div>

        <ul className={styles['station-services-station-list']} role="list">
          {stationServices.map((station) => (
            <li key={station.stationId}>
              <article className={styles['station-service-card']}>
                <h3 className={styles['station-service-station-name']}>{station.stationName}</h3>
                <p
                  className={styles['station-service-elevators']}
                  data-status={station.elevatorsStatus}
                >
                  {getElevatorStatusLabel(station.elevatorsStatus)}
                </p>

                <ul className={styles['station-services-list']} role="list">
                  {station.amenities.map((service) => {
                    const ServiceIcon = service.icon;
                    return (
                      <li
                        className={styles['station-service-chip']}
                        data-status={service.serviceStatus ?? 'available'}
                        key={`${station.stationId}-${service.label}`}
                      >
                        <span aria-hidden="true" className={styles['station-service-dot']} />
                        <ServiceIcon
                          aria-hidden="true"
                          className={styles['station-service-icon']}
                        />
                        <span>{service.label}</span>
                      </li>
                    );
                  })}
                </ul>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
