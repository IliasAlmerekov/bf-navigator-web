import { Train } from 'lucide-react';
import type { TimetableEntry } from '../types';
import styles from './TrainResultCard.module.css';

interface TrainResultCardProps {
  result: TimetableEntry;
  onSelect: () => void;
  isRecommended?: boolean;
}

function parseMinutes(t: string): number {
  if (t.includes(':')) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }
  return parseInt(t.slice(0, 2), 10) * 60 + parseInt(t.slice(2, 4), 10);
}

function calcDuration(dep: string | null, arr: string | null): string | null {
  if (!dep || !arr) return null;
  const totalDep = parseMinutes(dep);
  let totalArr = parseMinutes(arr);
  if (totalArr < totalDep) totalArr += 24 * 60;
  const diff = totalArr - totalDep;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDisplayTime(t: string | null): string {
  if (!t) return '—';
  if (t.includes(':')) return t.slice(0, 5);
  if (t.length >= 4) return `${t.slice(0, 2)}:${t.slice(2, 4)}`;
  return t;
}

export function TrainResultCard({ result, onSelect, isRecommended = false }: TrainResultCardProps) {
  const trainLabel = `${result.trainType} ${result.trainNumber}`.trim();
  const depDisplay = formatDisplayTime(result.departureTime);
  const arrDisplay = formatDisplayTime(result.arrivalTime);
  const duration = calcDuration(result.departureTime, result.arrivalTime);
  const originStation = result.route[0] ?? null;
  const destStation = result.route.length > 1 ? result.route[result.route.length - 1] : null;

  return (
    <article
      aria-label={`${trainLabel}, Abfahrt ${depDisplay}, Ankunft ${arrDisplay}`}
      className={styles.card}
    >
      {isRecommended && (
        <span className={styles.recommended} aria-label="Empfohlene Verbindung">
          Empfohlen
        </span>
      )}

      <div className={styles.timeRow}>
        <div className={styles.times}>
          <span className={styles.timeDep}>{depDisplay}</span>
          <Train aria-hidden="true" className={styles.trainIcon} />
          <span className={styles.timeArr}>{arrDisplay}</span>
        </div>
        {duration && <span className={styles.duration}>{duration}</span>}
      </div>

      <div className={styles.badgeRow}>
        <span className={styles.trainBadge}>{trainLabel}</span>
        <span className={styles.directBadge}>Direkt</span>
        {result.departurePlatform ? (
          <span className={styles.platformBadge}>Gleis {result.departurePlatform}</span>
        ) : null}
      </div>

      {(originStation || destStation) && (
        <div className={styles.stations} aria-label="Stationen">
          {originStation && (
            <span className={styles.station}>
              <span className={styles.stationDot} aria-hidden="true" />
              {originStation}
            </span>
          )}
          {destStation && (
            <span className={styles.station}>
              <span className={styles.stationDot} aria-hidden="true" />
              {destStation}
            </span>
          )}
        </div>
      )}

      <button
        aria-label={`${trainLabel} auswählen, Abfahrt ${depDisplay}`}
        className={styles.selectBtn}
        type="button"
        onClick={onSelect}
      >
        Route auswählen
      </button>
    </article>
  );
}
