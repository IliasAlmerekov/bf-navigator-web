import type { StationAccessibilityItem } from '../types';
import styles from '../RouteOverview.module.css';

type StationAccessibilityPanelProps = {
  items: StationAccessibilityItem[];
};

export function StationAccessibilityPanel({ items }: StationAccessibilityPanelProps) {
  return (
    <section
      aria-labelledby="station-accessibility-heading"
      className={`${styles.section} ${styles['station-section']}`}
    >
      <div className={styles['section-heading-row']}>
        <div className={styles['section-heading']}>
          <p className={styles['section-kicker']}>Station accessibility</p>
          <h2 id="station-accessibility-heading">
            Live access notes for every station touchpoint.
          </h2>
        </div>

        <button className={styles['secondary-button']} type="button">
          Refresh status
        </button>
      </div>

      <ul className={styles['station-list']} role="list">
        {items.map((item) => (
          <li key={item.station}>
            <article className={styles['station-card']}>
              <div className={styles['station-card-header']}>
                <div>
                  <h3>{item.station}</h3>
                  <p className={styles['station-summary']}>{item.summary}</p>
                </div>
                <span className={styles['station-badge']} data-status={item.status}>
                  {item.status}
                </span>
              </div>

              <ul className={styles['service-list']} role="list">
                {item.services.map((service) => {
                  const ServiceIcon = service.icon;

                  return (
                    <li className={styles['service-chip']} key={`${item.station}-${service.label}`}>
                      <ServiceIcon aria-hidden="true" />
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
  );
}
