import { SlidersHorizontal, Users } from 'lucide-react';
import styles from './SearchSummaryBar.module.css';

interface SearchSummaryBarProps {
  origin: string;
  destination: string;
  date: string;
  passengerCount: number;
  onFilterOpen: () => void;
}

export function SearchSummaryBar({
  origin,
  destination,
  date,
  passengerCount,
  onFilterOpen,
}: SearchSummaryBarProps) {
  return (
    <div className={styles.bar} role="region" aria-label="Suchanfrage Zusammenfassung">
      <div className={styles.route}>
        <span className={styles['route-origin']}>{origin}</span>
        <span className={styles['route-arrow']} aria-hidden="true">
          →
        </span>
        <span className={styles['route-destination']}>{destination}</span>
      </div>

      <div className={styles.meta}>
        <div className={styles['meta-info']}>
          <span className={styles['meta-date']}>{date}</span>
          <span className={styles.separator} aria-hidden="true">
            ·
          </span>
          <Users aria-hidden="true" className={styles['meta-icon']} />
          <span>
            {passengerCount} {passengerCount === 1 ? 'Reisender' : 'Reisende'}
          </span>
        </div>

        <button
          aria-label="Filter öffnen"
          className={styles['filter-btn']}
          type="button"
          onClick={onFilterOpen}
        >
          <SlidersHorizontal aria-hidden="true" />
          <span>Filter</span>
        </button>
      </div>
    </div>
  );
}
