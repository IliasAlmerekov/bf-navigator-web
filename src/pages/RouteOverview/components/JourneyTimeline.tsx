import { Clock3 } from 'lucide-react';
import type { TimelineItem } from '../types';
import styles from '../RouteOverview.module.css';

type JourneyTimelineProps = {
  items: TimelineItem[];
};

export function JourneyTimeline({ items }: JourneyTimelineProps) {
  return (
    <section aria-labelledby="journey-timeline-heading" className={styles.section}>
      <div className={styles['section-heading']}>
        <p className={styles['section-kicker']}>Journey timeline</p>
        <h2 id="journey-timeline-heading">Every transfer checked for step-free continuity.</h2>
      </div>

      <ol className={styles.timeline}>
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <li className={styles['timeline-item']} key={`${item.station}-${item.time}`}>
              <div className={styles['timeline-rail']} aria-hidden="true">
                <span className={styles['timeline-icon-wrap']}>
                  <Icon className={styles['timeline-icon']} />
                </span>
                {index < items.length - 1 ? <span className={styles['timeline-line']} /> : null}
              </div>

              <article className={styles['timeline-card']} data-kind={item.kind}>
                <div className={styles['timeline-card-header']}>
                  <div>
                    <p className={styles['timeline-status']} data-tone={item.statusTone}>
                      {item.statusLabel}
                    </p>
                    <h3>{item.title}</h3>
                  </div>

                  <p className={styles['timeline-time']}>
                    <Clock3 aria-hidden="true" />
                    <span>{item.time}</span>
                  </p>
                </div>

                <p className={styles['timeline-station']}>{item.station}</p>
                <p className={styles['timeline-detail']}>
                  <strong>{item.phase}.</strong> {item.detail}
                </p>

                <ul className={styles['timeline-tags']} role="list">
                  {item.amenities.map((amenity) => {
                    const AmenityIcon = amenity.icon;

                    return (
                      <li
                        className={styles['timeline-tag']}
                        key={`${item.station}-${amenity.label}`}
                      >
                        <AmenityIcon aria-hidden="true" />
                        <span>{amenity.label}</span>
                      </li>
                    );
                  })}
                </ul>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
