import { useState } from 'react';
import { ArrowRight, Headset, Info, SlidersHorizontal, TriangleAlert, Wrench } from 'lucide-react';
import wheelChairIcon from '../../assets/Onboarding/icons8-rollstuhl-26.png';
import styles from './Alerts.module.css';

type AlertScope = 'current' | 'saved';

const ACTIVE_ALERT_COUNT = 3;

export default function Alerts() {
  const [activeScope, setActiveScope] = useState<AlertScope>('current');

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Meldungen &amp; Stoerungen</h1>
        <button
          aria-label="Filter fuer Meldungen oeffnen"
          className={styles['filter-button']}
          type="button"
        >
          <SlidersHorizontal aria-hidden="true" />
        </button>
      </header>

      <div aria-label="Meldungsbereich" className={styles['segmented-control']} role="tablist">
        <button
          aria-controls="current-trip-panel"
          aria-selected={activeScope === 'current'}
          className={styles['scope-tab']}
          data-active={activeScope === 'current'}
          id="current-trip-tab"
          role="tab"
          type="button"
          onClick={() => {
            setActiveScope('current');
          }}
        >
          Aktuelle Fahrt
        </button>
        <button
          aria-controls="saved-routes-panel"
          aria-selected={activeScope === 'saved'}
          className={styles['scope-tab']}
          data-active={activeScope === 'saved'}
          id="saved-routes-tab"
          role="tab"
          type="button"
          onClick={() => {
            setActiveScope('saved');
          }}
        >
          Gespeicherte Routen
        </button>
      </div>

      <section aria-labelledby="active-priority-heading" className={styles.section}>
        <header className={styles['section-header']}>
          <h2 id="active-priority-heading">Aktive Prioritaet</h2>
          <p aria-live="polite" className={styles['alert-count']}>
            {activeScope === 'current' ? `${ACTIVE_ALERT_COUNT} Meldungen` : 'Gespeicherte Routen'}
          </p>
        </header>

        <div
          aria-labelledby="current-trip-tab"
          className={styles['tab-panel']}
          hidden={activeScope !== 'current'}
          id="current-trip-panel"
          role="tabpanel"
        >
          <ul className={styles['alert-list']}>
            <li>
              <article className={`${styles['alert-card']} ${styles['high-alert']}`}>
                <header className={styles['card-header']}>
                  <span aria-hidden="true" className={styles['icon-bubble']}>
                    <TriangleAlert className={styles['card-icon']} />
                  </span>
                  <div className={styles['card-title-group']}>
                    <h3>Aufzug an Gleis 3 defekt</h3>
                    <p>Frankfurt Hbf</p>
                  </div>
                  <time className={styles['card-time']} dateTime="14:02">
                    14:02
                  </time>
                </header>

                <p className={styles['severity-badge']}>Hohe Prioritaet</p>
                <p className={styles['card-body-text']}>
                  Der Hauptaufzug zu Gleis 3 ist ausser Betrieb. Der barrierefreie Einstieg ist
                  aktuell eingeschraenkt.
                </p>

                <button className={styles['primary-action']} type="button">
                  Umleitungsempfehlung ansehen
                  <ArrowRight aria-hidden="true" />
                </button>
              </article>
            </li>

            <li>
              <article className={`${styles['alert-card']} ${styles['info-alert']}`}>
                <header className={styles['card-header']}>
                  <span aria-hidden="true" className={styles['icon-bubble']}>
                    <Info className={styles['card-icon']} />
                  </span>
                  <div className={styles['card-title-group']}>
                    <h3>Nicht barrierefreier Gleiswechsel</h3>
                    <p>Berlin Hbf</p>
                  </div>
                  <span className={styles['info-chip']}>Hinweis</span>
                </header>

                <div aria-label="Gleiswechsel" className={styles['platform-metrics']}>
                  <div className={styles['metric-block']}>
                    <p className={styles['metric-label']}>Alt</p>
                    <p className={styles['metric-value-muted']}>04</p>
                  </div>

                  <div aria-hidden="true" className={styles['metric-divider']} />

                  <div className={styles['metric-block']}>
                    <p className={styles['metric-label']}>Neu</p>
                    <p className={styles['metric-value-strong']}>09</p>
                  </div>
                </div>

                <p className={styles['assistance-badge']}>Personalunterstuetzung verfuegbar</p>
              </article>
            </li>

            <li>
              <article className={`${styles['alert-card']} ${styles['delay-alert']}`}>
                <header className={styles['card-header']}>
                  <span aria-hidden="true" className={styles['icon-bubble']}>
                    <img alt="" className={styles['card-icon-image']} src={wheelChairIcon} />
                  </span>
                  <div className={styles['card-title-group']}>
                    <h3>Verspaeteter Assistenzservice</h3>
                    <p>Kassel-Wilhelmshohe</p>
                  </div>
                </header>

                <p className={styles['delay-text']}>
                  <strong>15 min</strong> Verzoegerung bei der Rampenbereitstellung
                </p>
              </article>
            </li>
          </ul>
        </div>

        <div
          aria-labelledby="saved-routes-tab"
          className={styles['tab-panel']}
          hidden={activeScope !== 'saved'}
          id="saved-routes-panel"
          role="tabpanel"
        >
          <article className={`${styles['alert-card']} ${styles['empty-state-card']}`}>
            <div aria-hidden="true" className={styles['empty-icon-bubble']}>
              <Wrench className={styles['card-icon']} />
            </div>
            <h3>Gespeicherte Routen derzeit stabil</h3>
            <p>Auf deinen gespeicherten Routen wurden aktuell keine Stoerungen erkannt.</p>
          </article>
        </div>
      </section>

      <section aria-labelledby="resolved-heading" className={styles.section}>
        <header className={styles['section-header']}>
          <h2 id="resolved-heading">Zuletzt behoben</h2>
        </header>

        <button className={styles['resolved-row']} type="button">
          <span className={styles['resolved-bullet']} aria-hidden="true" />
          <span className={styles['resolved-text-group']}>
            <span className={styles['resolved-title']}>Rolltreppe repariert</span>
            <span className={styles['resolved-subtitle']}>Muenchen Hbf - Behoben</span>
          </span>
          <ArrowRight aria-hidden="true" className={styles['resolved-arrow']} />
        </button>
      </section>

      <section aria-labelledby="other-routes-heading" className={styles.section}>
        <article className={`${styles['alert-card']} ${styles['other-routes-card']}`}>
          <div aria-hidden="true" className={styles['empty-icon-bubble']}>
            <Info className={styles['card-icon']} />
          </div>
          <h2 id="other-routes-heading">Weitere Routen</h2>
          <p>Auf deinen weiteren haeufigen Wegen wurden keine aktiven Stoerungen erkannt.</p>
        </article>
      </section>

      <button className={styles['live-support-button']} type="button">
        <Headset aria-hidden="true" className={styles['support-icon']} />
        Live-Unterstuetzung
      </button>
    </main>
  );
}
