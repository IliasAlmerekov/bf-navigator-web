import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import {
  ArrowLeft,
  HelpCircle,
  CheckCircle2,
  Navigation,
  TriangleAlert,
  Accessibility,
  X,
  ChevronRight,
  Clock,
  MapPin,
} from 'lucide-react';
import { LiveNavigationMap } from './components/LiveNavigationMap';
import styles from './LiveNavigation.module.css';

const ROUTE_STOPS = [
  {
    id: 'frankfurt',
    station: 'Frankfurt (Main) Hbf',
    time: '08:42',
    platform: 'Gleis 7',
    kind: 'departure' as const,
    isCurrent: true,
  },
  {
    id: 'kassel',
    station: 'Kassel-Wilhelmshöhe',
    time: '10:09',
    platform: 'Gleis 3',
    kind: 'transfer' as const,
    isCurrent: false,
  },
  {
    id: 'berlin',
    station: 'Berlin Hbf',
    time: '12:54',
    platform: 'Gleis 11',
    kind: 'arrival' as const,
    isCurrent: false,
  },
];

export default function LiveNavigation() {
  const [alternativeVisible, setAlternativeVisible] = useState(false);
  const router = useRouter();

  return (
    <main className={styles.page}>
      {/* Sticky header */}
      <header className={styles.header}>
        <button
          aria-label="Zurück zur Routenübersicht"
          className={styles['header-back']}
          type="button"
          onClick={() => router.history.back()}
        >
          <ArrowLeft aria-hidden="true" className={styles['header-back-icon']} />
        </button>

        <div className={styles['header-title-wrap']}>
          <p className={styles['header-train']}>ICE 782</p>
          <p className={styles['header-route']}>Frankfurt → Berlin</p>
        </div>

        <button
          aria-label="Hilfe und Barrierefreiheitsinformationen öffnen"
          className={styles['header-help']}
          type="button"
        >
          <HelpCircle aria-hidden="true" className={styles['header-help-icon']} />
        </button>
      </header>

      <div className={styles.layout}>
        {/* ─── LEFT / main column ─── */}
        <div className={styles['main-col']}>
          {/* Status banner */}
          <div aria-live="polite" className={styles['status-banner']} role="status">
            <CheckCircle2 aria-hidden="true" className={styles['status-banner-icon']} />
            <span className={styles['status-banner-text']}>Aufzüge funktionsfähig</span>
          </div>

          {/* Live instruction card */}
          <section aria-labelledby="instruction-heading" className={styles['instruction-card']}>
            <div className={styles['instruction-pulse-ring']} aria-hidden="true" />
            <p className={styles['instruction-kicker']}>Nächster Schritt</p>
            <h1 className={styles['instruction-heading']} id="instruction-heading">
              Aufzug E4 zu Gleis 7 nutzen
            </h1>
            <p className={styles['instruction-detail']}>
              <MapPin aria-hidden="true" className={styles['instruction-detail-icon']} />
              Gleis 7 · 150 m nördlicher Flügel
            </p>
          </section>

          {/* Live map */}
          <section
            aria-label="Karte – Weg zum Aufzug E4, Gleis 7, Frankfurt (Main) Hbf"
            className={styles['schematic-card']}
          >
            <div className={styles['schematic-header']}>
              <p className={styles['schematic-kicker']}>Live-Karte</p>
              <p className={styles['schematic-subtitle']}>Frankfurt (Main) Hbf · Weg zu Gleis 7</p>
            </div>
            <LiveNavigationMap />
            <p className={styles['schematic-legend']}>
              Gelb gestrichelt: Taktiler Leitpfad zu Aufzug E4 · Grün: Aufzug E4 · Rot: Gleis 7
            </p>
          </section>

          {/* Alternative route (expandable) */}
          <div className={styles['alt-section']}>
            <button
              aria-expanded={alternativeVisible}
              className={styles['alt-toggle']}
              type="button"
              onClick={() => setAlternativeVisible((v) => !v)}
            >
              <TriangleAlert aria-hidden="true" className={styles['alt-toggle-icon']} />
              <span className={styles['alt-toggle-label']}>Alternativweg: Südrampe</span>
              <span className={styles['alt-toggle-duration']}>+3 Min.</span>
              <ChevronRight
                aria-hidden="true"
                className={styles['alt-toggle-chevron']}
                data-open={alternativeVisible}
              />
            </button>
            {alternativeVisible && (
              <div className={styles['alt-detail']} role="region" aria-label="Alternativweg Details">
                <p className={styles['alt-detail-text']}>
                  Über Südrampe (Ebene 0 → Ebene 1) und Gang B zur Plattform 7.
                  Gesamtdistanz ca. 220 m.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT / panel column ─── */}
        <aside className={styles['panel-col']}>
          {/* Departure countdown */}
          <section aria-labelledby="countdown-heading" className={styles['countdown-card']}>
            <p className={styles['countdown-kicker']}>Abfahrt</p>
            <div className={styles['countdown-row']}>
              <span className={styles['countdown-value']}>4</span>
              <span className={styles['countdown-unit']}>Min.</span>
            </div>
            <p className={styles['countdown-train']} id="countdown-heading">
              ICE 782 · Gleis 7
            </p>
            <div className={styles['countdown-meta']}>
              <Clock aria-hidden="true" className={styles['countdown-meta-icon']} />
              <span>Pünktlich · Ab 08:42</span>
            </div>
          </section>

          {/* Journey progress */}
          <section aria-labelledby="journey-heading" className={styles['journey-card']}>
            <div className={styles['journey-header']}>
              <p className={styles['journey-kicker']}>Reiseverlauf</p>
              <h2 className={styles['journey-heading']} id="journey-heading">
                Frankfurt → Berlin
              </h2>
            </div>

            <ol aria-label="Haltestellen" className={styles.timeline} role="list">
              {ROUTE_STOPS.map((stop, index) => (
                <li
                  key={stop.id}
                  aria-current={stop.isCurrent ? 'step' : undefined}
                  className={styles['timeline-item']}
                  data-current={stop.isCurrent}
                  data-kind={stop.kind}
                >
                  <div className={styles['timeline-rail']}>
                    <div className={styles['timeline-dot']} />
                    {index < ROUTE_STOPS.length - 1 && (
                      <div className={styles['timeline-line']} />
                    )}
                  </div>
                  <div className={styles['timeline-content']}>
                    <div className={styles['timeline-row']}>
                      <div className={styles['timeline-left']}>
                        <p className={styles['timeline-station']}>{stop.station}</p>
                        <p className={styles['timeline-platform']}>{stop.platform}</p>
                      </div>
                      <p className={styles['timeline-time']}>{stop.time}</p>
                    </div>
                    {stop.isCurrent && (
                      <span className={styles['timeline-current-badge']}>
                        <Navigation aria-hidden="true" className={styles['timeline-current-icon']} />
                        Aktueller Standort
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Action buttons */}
          <div className={styles.actions}>
            <button className={styles['action-btn']} data-variant="secondary" type="button">
              <Accessibility aria-hidden="true" className={styles['action-btn-icon']} />
              Hilfe anfordern
            </button>
            <button
              className={styles['action-btn']}
              data-variant="ghost"
              type="button"
              onClick={() => router.history.back()}
            >
              <X aria-hidden="true" className={styles['action-btn-icon']} />
              Navigation beenden
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}

