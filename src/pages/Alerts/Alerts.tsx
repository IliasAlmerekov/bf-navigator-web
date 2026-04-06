import { useState } from 'react';
import {
  ArrowRight,
  Clock3,
  FileText,
  Headset,
  Info,
  MapPinned,
  Phone,
  SlidersHorizontal,
  TriangleAlert,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import wheelChairIcon from '../../assets/Onboarding/icons8-rollstuhl-26.png';
import styles from './Alerts.module.css';

type AlertScope = 'current' | 'saved';

type ResolvedAlert = {
  id: string;
  title: string;
  station: string;
  resolvedAt: string;
};

type QuickAction = {
  id: string;
  label: string;
  icon: LucideIcon;
};

const ACTIVE_ALERT_COUNT = 3;

const RESOLVED_ALERTS: ResolvedAlert[] = [
  {
    id: 'ticket-machines',
    title: 'Ticketautomaten repariert',
    station: 'St. Pancras Intl',
    resolvedAt: 'vor 12 Min.',
  },
  {
    id: 'escalator',
    title: 'Rolltreppe repariert',
    station: 'Muenchen Hbf',
    resolvedAt: 'vor 44 Min.',
  },
  {
    id: 'signal',
    title: 'Signalsystem stabilisiert',
    station: 'West Coast Mainline',
    resolvedAt: 'vor 70 Min.',
  },
];

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'delay-repay', label: 'Verspaetung melden', icon: Clock3 },
  { id: 'alt-map', label: 'Alternative Karte', icon: MapPinned },
  { id: 'station-info', label: 'Stationsinformationen', icon: Info },
];

export default function Alerts() {
  const [activeScope, setActiveScope] = useState<AlertScope>('current');

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles['header-main']}>
          <h1 className={styles.title}>Meldungen &amp; Stoerungen</h1>
          <div className={styles['header-status']}>
            <span className={styles['status-chip']}>{ACTIVE_ALERT_COUNT} Aktive Prioritaet</span>
            <span className={styles['status-text']}>Aktualisiert vor 2 Minuten</span>
          </div>
        </div>

        <div className={styles['header-actions']}>
          <button className={styles['secondary-action']} type="button">
            <FileText aria-hidden="true" />
            Export Report
          </button>
          <button className={styles['desktop-primary-action']} type="button">
            Meine Routen verwalten
          </button>
          <button
            aria-label="Filter fuer Meldungen oeffnen"
            className={styles['filter-button']}
            type="button"
          >
            <SlidersHorizontal aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className={styles['layout-grid']}>
        <div className={styles['main-column']}>
          <section aria-labelledby="active-priority-heading" className={styles.section}>
            <header className={styles['section-header']}>
              <h2 id="active-priority-heading">Aktive Prioritaet</h2>
              <p aria-live="polite" className={styles['alert-count']}>
                {activeScope === 'current'
                  ? `${ACTIVE_ALERT_COUNT} Meldungen aktiv`
                  : 'Gespeicherte Routen'}
              </p>
            </header>

            <div
              aria-label="Meldungsbereich"
              className={styles['segmented-control']}
              role="tablist"
            >
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
                      <span className={styles['type-chip']}>Station Alert</span>
                    </header>

                    <p className={styles['severity-badge']}>Hohe Prioritaet</p>
                    <p className={styles['card-body-text']}>
                      Der Hauptaufzug zu Gleis 3 ist ausser Betrieb. Der barrierefreie Einstieg ist
                      aktuell eingeschraenkt.
                    </p>

                    <div className={styles['card-tags']}>
                      <span>Standort: Grand Central</span>
                      <span>Zeit: 14:02</span>
                      <span>Status: Wartung laeuft</span>
                    </div>

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
                      <span className={styles['type-chip']}>Routing</span>
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

                    <div className={styles['card-tags']}>
                      <span>Zug: ICE 842</span>
                      <span>Warnung: Treppen only</span>
                      <span>PSA: Hoersystem only</span>
                    </div>
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
                      <span className={styles['type-chip']}>Staffing</span>
                    </header>

                    <p className={styles['delay-text']}>
                      <strong>15 min</strong> Verzoegerung bei der Rampenbereitstellung
                    </p>

                    <div className={styles['card-tags']}>
                      <span>Treffpunkt: Victoria Terminal</span>
                      <span>Timer: +15 Min.</span>
                      <span>Kontakt: Pre-Book Help</span>
                    </div>
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

          <section
            aria-labelledby="mobile-resolved-heading"
            className={`${styles.section} ${styles['mobile-only']}`}
          >
            <header className={styles['section-header']}>
              <h2 id="mobile-resolved-heading">Zuletzt behoben</h2>
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

          <section className={`${styles.section} ${styles['mobile-only']}`}>
            <article className={`${styles['alert-card']} ${styles['other-routes-card']}`}>
              <div aria-hidden="true" className={styles['empty-icon-bubble']}>
                <Info className={styles['card-icon']} />
              </div>
              <h2>Weitere Routen</h2>
              <p>Auf deinen weiteren haeufigen Wegen wurden keine aktiven Stoerungen erkannt.</p>
            </article>
          </section>
        </div>

        <aside aria-label="Zusatzinformationen" className={styles.sidebar}>
          <section aria-labelledby="resolved-heading" className={styles['sidebar-card']}>
            <header className={styles['sidebar-head']}>
              <h2 id="resolved-heading">Zuletzt behoben</h2>
            </header>

            <ul className={styles['resolved-list']}>
              {RESOLVED_ALERTS.map((item) => (
                <li key={item.id}>
                  <button className={styles['resolved-item']} type="button">
                    <span className={styles['resolved-item-title']}>{item.title}</span>
                    <span className={styles['resolved-item-meta']}>
                      {item.station} - {item.resolvedAt}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <button className={styles['link-action']} type="button">
              Archiv anzeigen
            </button>
          </section>

          <section className={`${styles['sidebar-card']} ${styles['support-card']}`}>
            <header className={styles['sidebar-head']}>
              <h2>Live Support</h2>
            </header>
            <p className={styles['support-copy']}>
              Sofortige Unterstuetzung bei Stoerungen, Umleitungen und Einstiegshilfe.
            </p>
            <button className={styles['support-chat-action']} type="button">
              <Headset aria-hidden="true" />
              Live Chat oeffnen
            </button>
            <button className={styles['support-phone-action']} type="button">
              <Phone aria-hidden="true" />
              Notfallassistenz
            </button>
          </section>

          <section className={`${styles['sidebar-card']} ${styles['quick-actions-card']}`}>
            <header className={styles['sidebar-head']}>
              <h2>Quick Actions</h2>
            </header>

            <ul className={styles['quick-actions-list']}>
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;

                return (
                  <li key={action.id}>
                    <button className={styles['quick-action-item']} type="button">
                      <span>{action.label}</span>
                      <Icon aria-hidden="true" className={styles['quick-action-icon']} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </aside>
      </div>

      <footer className={styles['desktop-footer']}>
        <div className={styles['footer-brand']}>
          <strong>Editorial Navigator Rail</strong>
          <span>&copy; 2026 Editorial Navigator Rail. Alle Rechte vorbehalten.</span>
        </div>

        <nav aria-label="Rechtliches" className={styles['footer-links']}>
          <button type="button">Barrierefreiheit</button>
          <button type="button">Datenschutz</button>
          <button type="button">Nutzungsbedingungen</button>
          <button type="button">Hilfe</button>
        </nav>
      </footer>

      <button className={`${styles['live-support-button']} ${styles['mobile-only']}`} type="button">
        <Headset aria-hidden="true" className={styles['support-icon']} />
        Live-Unterstuetzung
      </button>
    </main>
  );
}
