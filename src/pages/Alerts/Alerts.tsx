import { useState } from 'react';
import {
  ArrowRight,
  Headset,
  Info,
  SlidersHorizontal,
  TriangleAlert,
  Wrench,
} from 'lucide-react';
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
        <button aria-label="Filter fuer Meldungen oeffnen" className={styles.filterButton} type="button">
          <SlidersHorizontal aria-hidden="true" />
        </button>
      </header>

      <div aria-label="Meldungsbereich" className={styles.segmentedControl} role="tablist">
        <button
          aria-controls="current-trip-panel"
          aria-selected={activeScope === 'current'}
          className={styles.scopeTab}
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
          className={styles.scopeTab}
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
        <header className={styles.sectionHeader}>
          <h2 id="active-priority-heading">Aktive Prioritaet</h2>
          <p aria-live="polite" className={styles.alertCount}>
            {activeScope === 'current' ? `${ACTIVE_ALERT_COUNT} Meldungen` : 'Gespeicherte Routen'}
          </p>
        </header>

        <div
          aria-labelledby="current-trip-tab"
          className={styles.tabPanel}
          hidden={activeScope !== 'current'}
          id="current-trip-panel"
          role="tabpanel"
        >
          <ul className={styles.alertList}>
            <li>
              <article className={`${styles.alertCard} ${styles.highAlert}`}>
                <header className={styles.cardHeader}>
                  <span aria-hidden="true" className={styles.iconBubble}>
                    <TriangleAlert className={styles.cardIcon} />
                  </span>
                  <div className={styles.cardTitleGroup}>
                    <h3>Aufzug an Gleis 3 defekt</h3>
                    <p>Frankfurt Hbf</p>
                  </div>
                  <time className={styles.cardTime} dateTime="14:02">
                    14:02
                  </time>
                </header>

                <p className={styles.severityBadge}>Hohe Prioritaet</p>
                <p className={styles.cardBodyText}>
                  Der Hauptaufzug zu Gleis 3 ist ausser Betrieb. Der barrierefreie Einstieg ist
                  aktuell eingeschraenkt.
                </p>

                <button className={styles.primaryAction} type="button">
                  Umleitungsempfehlung ansehen
                  <ArrowRight aria-hidden="true" />
                </button>
              </article>
            </li>

            <li>
              <article className={`${styles.alertCard} ${styles.infoAlert}`}>
                <header className={styles.cardHeader}>
                  <span aria-hidden="true" className={styles.iconBubble}>
                    <Info className={styles.cardIcon} />
                  </span>
                  <div className={styles.cardTitleGroup}>
                    <h3>Nicht barrierefreier Gleiswechsel</h3>
                    <p>Berlin Hbf</p>
                  </div>
                  <span className={styles.infoChip}>Hinweis</span>
                </header>

                <div aria-label="Gleiswechsel" className={styles.platformMetrics}>
                  <div className={styles.metricBlock}>
                    <p className={styles.metricLabel}>Alt</p>
                    <p className={styles.metricValueMuted}>04</p>
                  </div>

                  <div aria-hidden="true" className={styles.metricDivider} />

                  <div className={styles.metricBlock}>
                    <p className={styles.metricLabel}>Neu</p>
                    <p className={styles.metricValueStrong}>09</p>
                  </div>
                </div>

                <p className={styles.assistanceBadge}>Personalunterstuetzung verfuegbar</p>
              </article>
            </li>

            <li>
              <article className={`${styles.alertCard} ${styles.delayAlert}`}>
                <header className={styles.cardHeader}>
                  <span aria-hidden="true" className={styles.iconBubble}>
                    <img alt="" className={styles.cardIconImage} src={wheelChairIcon} />
                  </span>
                  <div className={styles.cardTitleGroup}>
                    <h3>Verspaeteter Assistenzservice</h3>
                    <p>Kassel-Wilhelmshohe</p>
                  </div>
                </header>

                <p className={styles.delayText}>
                  <strong>15 min</strong> Verzoegerung bei der Rampenbereitstellung
                </p>
              </article>
            </li>
          </ul>
        </div>

        <div
          aria-labelledby="saved-routes-tab"
          className={styles.tabPanel}
          hidden={activeScope !== 'saved'}
          id="saved-routes-panel"
          role="tabpanel"
        >
          <article className={`${styles.alertCard} ${styles.emptyStateCard}`}>
            <div aria-hidden="true" className={styles.emptyIconBubble}>
              <Wrench className={styles.cardIcon} />
            </div>
            <h3>Gespeicherte Routen derzeit stabil</h3>
            <p>Auf deinen gespeicherten Routen wurden aktuell keine Stoerungen erkannt.</p>
          </article>
        </div>
      </section>

      <section aria-labelledby="resolved-heading" className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2 id="resolved-heading">Zuletzt behoben</h2>
        </header>

        <button className={styles.resolvedRow} type="button">
          <span className={styles.resolvedBullet} aria-hidden="true" />
          <span className={styles.resolvedTextGroup}>
            <span className={styles.resolvedTitle}>Rolltreppe repariert</span>
            <span className={styles.resolvedSubtitle}>Muenchen Hbf - Behoben</span>
          </span>
          <ArrowRight aria-hidden="true" className={styles.resolvedArrow} />
        </button>
      </section>

      <section aria-labelledby="other-routes-heading" className={styles.section}>
        <article className={`${styles.alertCard} ${styles.otherRoutesCard}`}>
          <div aria-hidden="true" className={styles.emptyIconBubble}>
            <Info className={styles.cardIcon} />
          </div>
          <h2 id="other-routes-heading">Weitere Routen</h2>
          <p>Auf deinen weiteren haeufigen Wegen wurden keine aktiven Stoerungen erkannt.</p>
        </article>
      </section>

      <button className={styles.liveSupportButton} type="button">
        <Headset aria-hidden="true" className={styles.supportIcon} />
        Live-Unterstuetzung
      </button>
    </main>
  );
}
