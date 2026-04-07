import styles from './SearchSummaryBar.module.css';

interface SearchSummaryBarProps {
  date: string;
  time: string;
  originName?: string;
  destinationName?: string;
  resultCount: number | null;
  onChangeSearch: () => void;
}

export function SearchSummaryBar({
  date,
  time,
  originName,
  destinationName,
  resultCount,
  onChangeSearch,
}: SearchSummaryBarProps) {
  const scheduleLabel = [date, time].filter(Boolean).join(' · ');
  const hasOrigin = Boolean(originName);
  const hasDestination = Boolean(destinationName);

  return (
    <div className={styles.bar} role="region" aria-label="Suchanfrage Zusammenfassung">
      {(hasOrigin || hasDestination) && (
        <div className={styles.route}>
          {hasOrigin && (
            <span className={styles['route-stop']}>
              <span className={styles['route-label']}>Von</span>
              <span className={styles['route-name']}>{originName}</span>
            </span>
          )}
          {hasOrigin && hasDestination && (
            <span aria-hidden="true" className={styles['route-arrow']}>
              →
            </span>
          )}
          {hasDestination && (
            <span className={styles['route-stop']}>
              <span className={styles['route-label']}>Nach</span>
              <span className={styles['route-name']}>{destinationName}</span>
            </span>
          )}
        </div>
      )}
      <div className={styles.meta}>
        {scheduleLabel && <span className={styles['meta-text']}>{scheduleLabel}</span>}
        <button
          aria-label="Suche ändern"
          className={styles['change-btn']}
          type="button"
          onClick={onChangeSearch}
        >
          Suche ändern
        </button>
      </div>
      {resultCount !== null && (
        <p aria-live="polite" className={styles.count}>
          {resultCount} {resultCount === 1 ? 'Verbindung' : 'Verbindungen'} gefunden
        </p>
      )}
    </div>
  );
}
