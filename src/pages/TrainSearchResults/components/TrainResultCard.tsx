import { AlertTriangle, ArrowRight, CheckCircle, Clock, Users, XCircle } from 'lucide-react';
import type { TrainResult } from '../types';
import styles from './TrainResultCard.module.css';

interface TrainResultCardProps {
  result: TrainResult;
  onSelect: (id: string) => void;
}

const STATUS_CONFIG = {
  ontime: {
    label: 'Pünktlich',
    icon: CheckCircle,
    className: 'status-ontime',
  },
  delayed: {
    label: 'Verspätet',
    icon: Clock,
    className: 'status-delayed',
  },
  cancelled: {
    label: 'Gestrichen',
    icon: XCircle,
    className: 'status-cancelled',
  },
} as const;

const CROWD_CONFIG = {
  low: { label: 'Geringes Risiko', className: 'crowd-low' },
  moderate: { label: 'Moderate Auslastung', className: 'crowd-moderate' },
  high: { label: 'Stark ausgelastet', className: 'crowd-high' },
} as const;

export function TrainResultCard({ result, onSelect }: TrainResultCardProps) {
  const status = STATUS_CONFIG[result.status];
  const crowd = CROWD_CONFIG[result.crowdLevel];
  const StatusIcon = status.icon;
  const isCancelled = result.status === 'cancelled';

  const statusLabel =
    result.status === 'delayed' && result.delayMinutes
      ? `${status.label} +${result.delayMinutes} Min.`
      : status.label;

  return (
    <article
      aria-label={`${result.trainType}, Abfahrt ${result.departureTime}, Ankunft ${result.arrivalTime}, ${statusLabel}`}
      className={styles.card}
      data-cancelled={isCancelled}
    >
      <div className={styles.top}>
        <div className={styles['time-block']}>
          <div className={styles.times}>
            <span className={styles['time-dep']}>{result.departureTime}</span>
            <span className={styles['time-arrow']} aria-hidden="true">
              <ArrowRight aria-hidden="true" />
            </span>
            <span className={styles['time-arr']}>{result.arrivalTime}</span>
          </div>
          <div className={styles.meta}>
            <span className={styles.duration}>{result.duration}</span>
            <span className={styles.separator} aria-hidden="true">
              ·
            </span>
            <span className={styles.transfers}>
              {result.transfers === 0
                ? 'Direktverbindung'
                : `${result.transfers} ${result.transfers === 1 ? 'Umstieg' : 'Umstiege'}`}
            </span>
          </div>
        </div>

        <div className={styles['train-block']}>
          <span className={styles['train-type']}>{result.trainType}</span>
          {result.platform && <span className={styles.platform}>{result.platform}</span>}
        </div>
      </div>

      <div className={styles.badges}>
        <span
          aria-label={`Status: ${statusLabel}`}
          className={`${styles.badge} ${styles[status.className]}`}
        >
          <StatusIcon aria-hidden="true" className={styles['badge-icon']} />
          {statusLabel}
        </span>

        <span
          aria-label={`Auslastung: ${crowd.label}`}
          className={`${styles.badge} ${styles[crowd.className]}`}
        >
          <Users aria-hidden="true" className={styles['badge-icon']} />
          {crowd.label}
        </span>
      </div>

      {result.accessibilityNote && (
        <div aria-live="polite" className={styles['accessibility-row']} role="status">
          {result.isAccessible ? (
            <CheckCircle aria-hidden="true" className={styles['a11y-icon-ok']} />
          ) : (
            <AlertTriangle aria-hidden="true" className={styles['a11y-icon-warn']} />
          )}
          <span className={styles['a11y-note']}>{result.accessibilityNote}</span>
        </div>
      )}

      <div className={styles.footer}>
        <span className={styles.price} aria-label={`Preis: ${result.price}`}>
          {result.price}
        </span>
        <button
          aria-label={`${result.trainType} Route auswählen, Abfahrt ${result.departureTime}`}
          className={styles['select-btn']}
          disabled={isCancelled}
          type="button"
          onClick={() => onSelect(result.id)}
        >
          Route auswählen
          <ArrowRight aria-hidden="true" className={styles['btn-icon']} />
        </button>
      </div>
    </article>
  );
}
