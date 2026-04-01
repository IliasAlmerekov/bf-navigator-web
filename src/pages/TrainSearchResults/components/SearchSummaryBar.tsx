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

  return (
    <div className={styles.bar} role="region" aria-label="Suchanfrage Zusammenfassung">
      {(originName || destinationName) && (
        <p className={styles.route}>
          {originName} → {destinationName}
        </p>
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
