import styles from './SearchSummaryBar.module.css';

interface SearchSummaryBarProps {
  date: string;
  time: string;
  originName?: string;
  destinationName?: string;
  passengerCount: number;
  resultCount: number | null;
  onChangeSearch: () => void;
}

export function SearchSummaryBar({
  date,
  time,
  originName,
  destinationName,
  passengerCount,
  resultCount,
  onChangeSearch,
}: SearchSummaryBarProps) {
  const scheduleLabel = [date, time].filter(Boolean).join(' · ');
  const passengerLabel = `${passengerCount} ${passengerCount === 1 ? 'Reisender' : 'Reisende'}`;

  return (
    <div className={styles.bar} role="region" aria-label="Suchanfrage Zusammenfassung">
      {(originName || destinationName) && (
        <p className={styles.route}>
          {originName} → {destinationName}
        </p>
      )}
      <div className={styles.meta}>
        <span className={styles.metaText}>
          {scheduleLabel} · {passengerLabel}
        </span>
        <button
          aria-label="Suche ändern"
          className={styles.changeBtn}
          type="button"
          onClick={onChangeSearch}
        >
          Suche ändern
        </button>
      </div>
      {resultCount !== null && (
        <p className={styles.count} aria-live="polite">
          {resultCount} {resultCount === 1 ? 'Verbindung' : 'Verbindungen'} gefunden
        </p>
      )}
    </div>
  );
}
