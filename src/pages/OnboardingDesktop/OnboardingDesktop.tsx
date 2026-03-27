import { useRef, useState } from 'react';
import styles from './OnboardingDesktop.module.css';
import wheelChairIcon from '../../assets/Onboarding/icons8-rollstuhl-26.png';
import lowVisionIcon from '../../assets/Onboarding/icons8-sehschwäche-48.png';
import hearingIcon from '../../assets/Onboarding/icons8-taub-67.png';
import limitedMobilityIcon from '../../assets/Onboarding/icons8-zugang-für-blinde-50.png';
import confirmationIcon from '../../assets/Onboarding/icons8-anerkennung-50.png';
import trainPhoto from '../../assets/Onboarding/ice taufe europa europe.webp';

type MobilityOption = {
  id: string;
  title: string;
  subtitle: string;
  iconSrc: string;
};

const mobilityOptions: MobilityOption[] = [
  {
    id: 'wheelchair',
    title: 'Rollstuhlzugang',
    subtitle: 'Routen mit Rampen und Aufzügen',
    iconSrc: wheelChairIcon,
  },
  {
    id: 'vision',
    title: 'Sehbehinderung',
    subtitle: 'Taktile Leitsysteme & Ansagen',
    iconSrc: lowVisionIcon,
  },
  {
    id: 'hearing',
    title: 'Hörbehinderung',
    subtitle: 'Visuelle Signale & Anzeigen',
    iconSrc: hearingIcon,
  },
  {
    id: 'mobility',
    title: 'Eingeschränkte Mobilität',
    subtitle: 'Minimale Stufen und kurze Wege',
    iconSrc: limitedMobilityIcon,
  },
];

export default function OnboardingDesktop() {
  const [selectedOptionId, setSelectedOptionId] = useState<string>('vision');
  const supportStepRef = useRef<HTMLElement | null>(null);
  const doneStepRef = useRef<HTMLElement | null>(null);

  const scrollToSection = (target: HTMLElement | null) => {
    if (!target) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <span className={styles.brand}>BF-NAVIGATOR</span>
          <nav aria-label="Hauptnavigation" className={styles.nav}>
            <a href="#hilfe" className={styles['nav-link']}>
              Hilfe
            </a>
            <a href="#barrierefreiheit" className={styles['nav-link']}>
              Barrierefreiheit
            </a>
            <a href="#sprache" className={styles['nav-link']}>
              Sprache
            </a>
            <button type="button" className={styles['sign-in-button']}>
              Anmelden
            </button>
          </nav>
        </header>

        <section className={styles.hero} aria-labelledby="onboarding-title-desktop">
          <p className={styles.badge}>ONBOARDING</p>
          <h1 id="onboarding-title-desktop" className={styles.h1}>
            Ihre barrierefreie Reise
            <br />
            beginnt hier
          </h1>
          <p className={styles.subtitle}>
            Wir gestalten Mobilität grenzenlos. Passen Sie Ihr Reiseerlebnis an Ihre Bedürfnisse an.
          </p>
        </section>

        <section className={styles.panels} aria-label="Onboarding Schritte">
          <article className={styles.panel} aria-labelledby="welcome-step-title">
            <div className={styles['step-heading-row']}>
              <span className={styles['step-index']} aria-hidden="true">
                1
              </span>
              <h2 id="welcome-step-title" className={styles['step-title']}>
                Willkommen
              </h2>
            </div>

            <img
              src={trainPhoto}
              alt="Moderner ICE-Zug am Bahnsteig"
              className={styles['welcome-image']}
            />
            <p className={styles['panel-copy']}>
              Willkommen an Bord der Trans-Europa Linie. Wir freuen uns, Sie auf Ihrem Weg durch
              Europa zu begleiten.
            </p>

            <button
              type="button"
              className={styles['panel-action-button']}
              onClick={() => scrollToSection(supportStepRef.current)}
            >
              Jetzt starten
            </button>
          </article>

          <article
            ref={supportStepRef}
            className={styles.panel}
            aria-labelledby="support-step-title"
          >
            <div className={styles['step-heading-row']}>
              <span className={styles['step-index']} aria-hidden="true">
                2
              </span>
              <h2 id="support-step-title" className={styles['step-title']}>
                Wie können wir Sie unterstützen?
              </h2>
            </div>

            <ul className={styles['option-grid']} aria-label="Mobilitätsoptionen">
              {mobilityOptions.map((option) => {
                const isSelected = selectedOptionId === option.id;

                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      className={`${styles['option-tile']} ${isSelected ? styles['option-tile-selected'] : ''}`}
                      aria-pressed={isSelected}
                      onClick={() => setSelectedOptionId(option.id)}
                    >
                      <span className={styles['option-icon']} aria-hidden="true">
                        <img src={option.iconSrc} alt="" className={styles['option-icon-image']} />
                      </span>
                      <span className={styles['option-content']}>
                        <span className={styles['option-title']}>{option.title}</span>
                        <span className={styles['option-subtitle']}>{option.subtitle}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <p className={styles['info-strip']}>
              Ihre Auswahl optimiert automatische Suchergebnisse.
            </p>

            <button
              type="button"
              className={styles['panel-action-button']}
              onClick={() => scrollToSection(doneStepRef.current)}
            >
              Weiter
            </button>
          </article>

          <article ref={doneStepRef} className={styles.panel} aria-labelledby="done-step-title">
            <div className={styles['step-heading-row']}>
              <span className={styles['step-index']} aria-hidden="true">
                3
              </span>
              <h2 id="done-step-title" className={styles['step-title']}>
                Alles bereit
              </h2>
            </div>

            <div className={styles['success-circle']} aria-hidden="true">
              <span className={styles['success-inner-circle']}>
                <img src={confirmationIcon} alt="" className={styles['confirmation-icon-image']} />
              </span>
            </div>

            <h3 className={styles['success-title']}>Profil konfiguriert</h3>
            <p className={styles['panel-copy']}>
              Wir haben Ihre Präferenzen gespeichert. Sie können nun Ihre erste barrierefreie Reise
              planen.
            </p>

            <p className={styles['status-chip']}>Schritt für Schritt barrierefrei</p>

            <button type="button" className={styles['primary-button']}>
              Route finden
              <span aria-hidden="true" className={styles['arrow-icon']}>
                -&gt;
              </span>
            </button>

            <button type="button" className={styles['secondary-text-button']}>
              Einrichtung überspringen
            </button>
          </article>
        </section>

        <aside className={styles.quote} aria-label="Leitprinzip">
          <span className={styles['quote-icon']} aria-hidden="true">
            <img src={wheelChairIcon} alt="" className={styles['quote-icon-image']} />
          </span>
          <span className={styles['quote-icon']} aria-hidden="true">
            <img src={lowVisionIcon} alt="" className={styles['quote-icon-image']} />
          </span>
          <span className={styles['quote-icon']} aria-hidden="true">
            <img src={hearingIcon} alt="" className={styles['quote-icon-image']} />
          </span>
          <span className={styles['quote-icon']} aria-hidden="true">
            <img src={limitedMobilityIcon} alt="" className={styles['quote-icon-image']} />
          </span>
          <span className={styles['quote-icon']} aria-hidden="true">
            <img src={confirmationIcon} alt="" className={styles['quote-icon-image']} />
          </span>
          <p className={styles['quote-text']}>
            "Unser Ziel ist eine 100% barrierefreie Vernetzung Europas."
          </p>
        </aside>
      </div>
    </main>
  );
}
