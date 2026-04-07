import { AlertTriangle, ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import accessibleIcon from '../../../assets/RouteOverview/disabled-access-50.png';
import elevatorIcon from '../../../assets/RouteOverview/elevator-50.png';
import escalatorIcon from '../../../assets/RouteOverview/escalator-50.png';
import toiletIcon from '../../../assets/RouteOverview/toilet-50.png';
import type { ElevatorStatus, RouteStationServicesPanel } from '../types';
import styles from '../RouteOverview.module.css';

type StationServicesPanelProps = {
  panel: RouteStationServicesPanel;
};

const elevatorStatusPresentation: Record<
  ElevatorStatus,
  {
    icon: typeof AlertTriangle;
  }
> = {
  available: {
    icon: CheckCircle2,
  },
  limited: {
    icon: AlertTriangle,
  },
  out_of_service: {
    icon: AlertTriangle,
  },
};

const liveEquipmentIconById = {
  accessible_toilets: toiletIcon,
  elevators: elevatorIcon,
  escalators: escalatorIcon,
  tactile_guidance: accessibleIcon,
} as const;

function formatUnits(count: number) {
  return `${count} ${count === 1 ? 'ANLAGE' : 'ANLAGEN'}`;
}

export function StationServicesPanel({ panel }: StationServicesPanelProps) {
  const ElevatorStatusIcon = elevatorStatusPresentation[panel.elevatorCard.status].icon;

  return (
    <section
      aria-describedby="station-services-updated"
      aria-labelledby="station-services-heading"
      className={styles['station-services-below']}
    >
      <div className={styles['station-services-header']}>
        <div className={styles['station-services-title-wrap']}>
          <h2 id="station-services-heading">Bahnhofsservice</h2>
          <p className={styles['station-services-subtitle']}>{panel.stationName}</p>
        </div>
        <p id="station-services-updated" className={styles['station-services-updated']}>
          {panel.lastUpdated}
        </p>
      </div>

      <article className={styles['elevator-status-card']} data-status={panel.elevatorCard.status}>
        <div className={styles['equipment-card-top']}>
          <span
            aria-hidden="true"
            className={styles['elevator-status-icon-wrap']}
            data-status={panel.elevatorCard.status}
          >
            <ElevatorStatusIcon className={styles['elevator-status-icon']} />
          </span>

          <span className={styles['equipment-card-units']}>
            {formatUnits(panel.elevatorCard.totalUnits)}
          </span>
        </div>

        <div className={styles['equipment-card-copy']}>
          <p className={styles['elevator-status-kicker']}>Bahnhofsbarrierefreiheit</p>
          <h3 className={styles['elevator-status-title']}>{panel.elevatorCard.title}</h3>
          <dl className={styles['equipment-card-metrics']}>
            <div className={styles['equipment-card-metric']}>
              <dt>In Betrieb</dt>
              <dd className={styles['equipment-card-value-available']}>
                {panel.elevatorCard.availableUnits} in Betrieb
              </dd>
            </div>
            <div className={styles['equipment-card-metric']}>
              <dt>Außer Betrieb</dt>
              <dd className={styles['equipment-card-value-unavailable']}>
                {panel.elevatorCard.outOfServiceUnits} außer Betrieb
              </dd>
            </div>
          </dl>
        </div>

        <p className={styles['elevator-status-description']}>{panel.elevatorCard.description}</p>

        {panel.elevatorCard.alternateRoute ? (
          <div className={styles['elevator-status-route']}>
            <span aria-hidden="true" className={styles['elevator-status-route-icon-wrap']}>
              <ArrowRightLeft className={styles['elevator-status-route-icon']} />
            </span>
            <div className={styles['elevator-status-route-copy']}>
              <p className={styles['elevator-status-route-label']}>Umgeleitete Route</p>
              <p className={styles['elevator-status-route-text']}>
                {panel.elevatorCard.alternateRoute}
              </p>
            </div>
          </div>
        ) : null}
      </article>

      <div className={styles['live-equipment-heading-row']}>
        <div>
          <h3 className={styles['live-equipment-heading']} id="live-equipment-heading">
            Live-Anlagenstatus
          </h3>
        </div>
      </div>

      <ul
        aria-labelledby="live-equipment-heading"
        className={styles['station-services-grid']}
        role="list"
      >
        {panel.liveEquipmentCards.map((card) => {
          return (
            <li key={card.id}>
              <article className={styles['station-status-card']} data-status={card.status}>
                <div className={styles['equipment-card-top']}>
                  <span
                    aria-hidden="true"
                    className={styles['station-status-icon-wrap']}
                    data-status={card.status}
                  >
                    <img
                      alt=""
                      className={styles['station-status-icon']}
                      src={liveEquipmentIconById[card.id]}
                    />
                  </span>

                  <span className={styles['equipment-card-units']}>
                    {formatUnits(card.totalUnits)}
                  </span>
                </div>

                <div className={styles['equipment-card-copy']}>
                  <h4 className={styles['station-status-title']}>{card.title}</h4>
                  <dl className={styles['equipment-card-metrics']}>
                    <div className={styles['equipment-card-metric']}>
                      <dt>In Betrieb</dt>
                      <dd className={styles['equipment-card-value-available']}>
                        {card.availableUnits} in Betrieb
                      </dd>
                    </div>
                    <div className={styles['equipment-card-metric']}>
                      <dt>Außer Betrieb</dt>
                      <dd className={styles['equipment-card-value-unavailable']}>
                        {card.outOfServiceUnits} außer Betrieb
                      </dd>
                    </div>
                  </dl>
                </div>

                <p className={styles['station-status-summary']}>{card.summary}</p>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
