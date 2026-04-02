import { ArrowRight, Clock, PersonStanding } from 'lucide-react';
import type { TrainRouteResponse, TrainRouteTransit } from '../types';
import styles from './TrainResultCard.module.css';

interface TrainResultCardProps {
  route: TrainRouteResponse;
  onSelect: () => void;
  isRecommended?: boolean;
}

interface TransitSegment {
  agencyName: string;
  lineName: string;
  lineColor: string;
  lineTextColor: string;
  departureTime: string;
  arrivalTime: string;
  departureStop: string;
  arrivalStop: string;
  vehicleType: string;
}

function getTransitSegments(transits: TrainRouteTransit[]): TransitSegment[] {
  return transits.map((transit) => ({
    agencyName: transit.agencyName,
    arrivalStop: transit.arrival.stationName,
    arrivalTime: transit.arrival.arrivalTime ?? '—',
    departureStop: transit.departure.stationName,
    departureTime: transit.departure.departureTime ?? '—',
    lineColor: '#002068',
    lineName: transit.trainName,
    lineTextColor: '#ffffff',
    vehicleType: transit.vehicleType,
  }));
}

function formatTransitTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getUniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function TrainResultCard({ route, onSelect, isRecommended = false }: TrainResultCardProps) {
  if (route.transits.length === 0) return null;

  const segments = getTransitSegments(route.transits);
  const duration = route.localizedDurationText;
  const firstTransit = segments[0];
  const lastTransit = segments[segments.length - 1];
  const overallDep = firstTransit?.departureTime ?? '—';
  const overallArr = lastTransit?.arrivalTime ?? '—';
  const overallDepLabel = formatTransitTime(overallDep);
  const overallArrLabel = formatTransitTime(overallArr);
  const transfers = segments.length > 1 ? segments.length - 1 : 0;
  const hasWalk = false;
  const agencies = getUniqueValues(segments.map((segment) => segment.agencyName));
  const vehicleTypes = getUniqueValues(segments.map((segment) => segment.vehicleType));
  const transitMeta = [...agencies, ...vehicleTypes].join(' · ');

  const ariaLabel = `${overallDepLabel} bis ${overallArrLabel}, Dauer ${duration}${transfers > 0 ? `, ${transfers} Umstieg${transfers > 1 ? 'e' : ''}` : ', Direkt'}`;

  return (
    <article aria-label={ariaLabel} className={styles.card}>
      {isRecommended && (
        <span aria-label="Empfohlene Verbindung" className={styles.recommended}>
          Empfohlen
        </span>
      )}

      <div className={styles['time-row']}>
        <div className={styles.times}>
          <time className={styles.time} dateTime={overallDep}>
            {overallDepLabel}
          </time>
          <span aria-hidden="true" className={styles['time-sep']}>
            —
          </span>
          <time className={styles.time} dateTime={overallArr}>
            {overallArrLabel}
          </time>
        </div>
        <div className={styles.meta}>
          <Clock aria-hidden="true" className={styles['meta-icon']} />
          <span className={styles.duration}>{duration}</span>
        </div>
      </div>

      {segments.length > 0 && (
        <div aria-label="Verbindungsübersicht" className={styles['segment-row']}>
          {segments.map((segment, index) => (
            <span key={`${segment.lineName}-${index}`} className={styles['segment-item']}>
              <span
                aria-label={`${segment.lineName} ${segment.vehicleType}`}
                className={styles['line-badge']}
                style={{ background: segment.lineColor, color: segment.lineTextColor }}
              >
                {segment.lineName}
              </span>
              {index < segments.length - 1 && (
                <ArrowRight aria-hidden="true" className={styles['transfer-arrow']} />
              )}
            </span>
          ))}
        </div>
      )}

      {transitMeta && <p className={styles.duration}>{transitMeta}</p>}

      {firstTransit && lastTransit && (
        <div aria-label="Von / Nach" className={styles.stations}>
          <span className={styles.station}>{firstTransit.departureStop}</span>
          <span aria-hidden="true" className={styles['station-sep']} />
          <span className={styles.station}>{lastTransit.arrivalStop}</span>
        </div>
      )}

      <div className={styles['info-row']}>
        {transfers === 0 ? (
          <span className={styles['info-badge']}>Direkt</span>
        ) : (
          <span className={styles['info-badge']}>
            {transfers} Umstieg{transfers > 1 ? 'e' : ''}
          </span>
        )}
        {hasWalk && (
          <span aria-label="Fußweg erforderlich" className={styles['walk-badge']}>
            <PersonStanding aria-hidden="true" className={styles['walk-icon']} />
            Fußweg
          </span>
        )}
      </div>

      <button
        aria-label={`Verbindung auswählen: ${overallDepLabel} bis ${overallArrLabel}`}
        className={styles['select-btn']}
        onClick={onSelect}
        type="button"
      >
        Route auswählen
      </button>
    </article>
  );
}
