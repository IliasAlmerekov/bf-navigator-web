import { ArrowRightLeft } from 'lucide-react';
import type { TimelineItem } from '../types';
import styles from '../RouteOverview.module.css';

type JourneyTimelineProps = {
  items: TimelineItem[];
};

export function JourneyTimeline({ items }: JourneyTimelineProps) {
  return (
    <ol aria-label="Reiseverlauf" className={styles.timeline}>
      {items.map((item, index) => (
        <li className={styles['timeline-item']} key={item.station}>
          <div aria-hidden="true" className={styles['timeline-rail']}>
            <span className={styles['timeline-dot']} data-kind={item.kind} />
            {index < items.length - 1 ? <span className={styles['timeline-line']} /> : null}
          </div>

          <div className={styles['timeline-content']}>
            <div className={styles['timeline-row']}>
              <div className={styles['timeline-left']}>
                <p className={styles['station-name']}>{item.station}</p>
                <p className={styles['platform-info']}>{item.platformInfo}</p>
              </div>

              {item.transferNote ? (
                <div
                  aria-label={[item.transferNote, item.transferTrain].filter(Boolean).join(', ')}
                  className={styles['transfer-note']}
                >
                  <span className={styles['transfer-icon-wrap']}>
                    <ArrowRightLeft aria-hidden="true" className={styles['transfer-icon']} />
                  </span>
                  <div>
                    <p className={styles['transfer-duration']}>{item.transferNote}</p>
                    <p className={styles['transfer-train']}>{item.transferTrain}</p>
                  </div>
                </div>
              ) : null}

              <div className={styles['timeline-right']}>
                <p className={styles['timeline-time']}>{item.time}</p>
                <p className={styles['timeline-label']}>{item.label}</p>
              </div>
            </div>

            {item.amenities.length > 0 ? (
              <ul
                aria-label={`${item.station} Ausstattung`}
                className={styles['timeline-tags']}
                role="list"
              >
                {item.amenities.map((amenity) => {
                  const Icon = amenity.icon;
                  return (
                    <li className={styles['timeline-tag']} key={amenity.label}>
                      <Icon aria-hidden="true" />
                      <span>{amenity.label}</span>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
