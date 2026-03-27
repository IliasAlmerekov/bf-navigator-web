import { useRef, useState } from 'react';
import styles from './Onboarding.module.css';
import wheelChairIcon from '../../assets/Onboarding/icons8-rollstuhl-26.png';
import lowVisionIcon from '../../assets/Onboarding/icons8-sehschwäche-48.png';
import hearingIcon from '../../assets/Onboarding/icons8-taub-67.png';
import limitedMobilityIcon from '../../assets/Onboarding/icons8-zugang-für-blinde-50.png';
import confirmationIcon from '../../assets/Onboarding/icons8-anerkennung-50.png';
import trainPhoto from '../../assets/Onboarding/ice taufe europa europe.webp';

type Step = 1 | 2 | 3;

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

function ProgressDots({ currentStep }: { currentStep: Step }) {
  return (
    <ol
      className={styles['progress-dots']}
      aria-label={`Fortschritt: Schritt ${currentStep} von 3`}
    >
      {[1, 2, 3].map((step) => (
        <li key={step} className={styles['progress-dot-item']}>
          <span
            className={`${styles['progress-dot']} ${step === currentStep ? styles['progress-dot-current'] : ''}`}
            aria-current={step === currentStep ? 'step' : undefined}
          />
        </li>
      ))}
    </ol>
  );
}

export default function Onboarding() {
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>(['wheelchair']);
  const stepOneRef = useRef<HTMLElement | null>(null);
  const stepTwoRef = useRef<HTMLElement | null>(null);
  const stepThreeRef = useRef<HTMLElement | null>(null);

  const scrollToStep = (step: Step) => {
    const targetByStep: Record<Step, HTMLElement | null> = {
      1: stepOneRef.current,
      2: stepTwoRef.current,
      3: stepThreeRef.current,
    };

    const target = targetByStep[step];
    if (!target) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  };

  const handleSelectOption = (optionId: string) => {
    setSelectedOptionIds([optionId]);

    if (optionId === 'vision') {
      scrollToStep(3);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.column}>
        <section
          ref={stepOneRef}
          className={`${styles.block} ${styles['block-first']}`}
          aria-labelledby="onboarding-title"
        >
          <div className={styles['brand-row']}>
            <span className={styles['brand-text']}>BF-NAVIGATORE</span>
            <span className={styles['locale-tag']}>DE</span>
          </div>

          <nav aria-label="Hauptnavigation" className={styles['mobile-nav']}>
            <a href="#hilfe" className={styles['mobile-nav-link']}>
              Hilfe
            </a>
            <a href="#barrierefreiheit" className={styles['mobile-nav-link']}>
              Barrierefreiheit
            </a>
            <a href="#sprache" className={styles['mobile-nav-link']}>
              Sprache
            </a>
            <button type="button" className={styles['mobile-nav-button']}>
              Anmelden
            </button>
          </nav>

          <div className={styles['mobile-step-heading-row']}>
            <span className={styles['mobile-step-index']} aria-hidden="true">
              1
            </span>
            <p className={styles['mobile-step-title']}>Willkommen</p>
          </div>

          <div className={styles['hero-rectangle']} aria-hidden="true">
            <div
              className={styles['hero-image-layer']}
              style={{ backgroundImage: `url("${trainPhoto}")` }}
            />
            <div className={styles['hero-atmosphere']} />
          </div>

          <h1 id="onboarding-title" className={styles.h1}>
            Ihre barrierefreie Reise
            <br />
            beginnt hier
          </h1>
          <p className={styles.subtitle}>
            Wir gestalten Mobilität grenzenlos. Passen Sie Ihr Reiseerlebnis an Ihre Bedürfnisse an.
          </p>

          <button
            type="button"
            className={styles['primary-button']}
            onClick={() => scrollToStep(2)}
          >
            Jetzt starten
          </button>

          <ProgressDots currentStep={1} />
        </section>

        <section ref={stepTwoRef} className={styles.block} aria-labelledby="support-title">
          <div className={styles['mobile-step-heading-row']}>
            <span className={styles['mobile-step-index']} aria-hidden="true">
              2
            </span>
            <h2 id="support-title" className={styles['mobile-step-heading']}>
              Wie können wir Sie unterstützen?
            </h2>
          </div>

          <ul className={styles['option-list']} aria-label="Mobilitätsoptionen">
            {mobilityOptions.map((option) => {
              const isSelected = selectedOptionIds.includes(option.id);

              return (
                <li key={option.id}>
                  <button
                    type="button"
                    className={`${styles['option-card']} ${isSelected ? styles['option-card-selected'] : ''}`}
                    aria-pressed={isSelected}
                    onClick={() => handleSelectOption(option.id)}
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

          <p className={styles['support-info-chip']}>
            Ihre Auswahl optimiert automatische Suchergebnisse.
          </p>

          <button
            type="button"
            className={styles['primary-button']}
            onClick={() => scrollToStep(3)}
            disabled={selectedOptionIds.length === 0}
          >
            Weiter
          </button>

          <ProgressDots currentStep={2} />
        </section>

        <section
          ref={stepThreeRef}
          className={`${styles.block} ${styles['block-last']}`}
          aria-labelledby="ready-title"
        >
          <div className={styles['mobile-step-heading-row']}>
            <span className={styles['mobile-step-index']} aria-hidden="true">
              3
            </span>
            <h2 id="ready-title" className={styles['mobile-step-heading']}>
              Alles bereit.
            </h2>
          </div>

          <div className={styles['success-circle']} aria-hidden="true">
            <span className={styles['success-inner-circle']}>
              <img src={confirmationIcon} alt="" className={styles['confirmation-icon-image']} />
            </span>
          </div>

          <p className={styles['body-copy']}>
            Wir haben Ihre Präferenzen gespeichert. Sie können nun Ihre erste barrierefreie Reise
            planen.
          </p>

          <p className={styles['neutral-chip']}>Schritt für Schritt barrierefrei</p>

          <button type="button" className={styles['primary-button']}>
            Route finden -&gt;
          </button>
          <button
            type="button"
            className={styles['secondary-button']}
            onClick={() => scrollToStep(1)}
          >
            Einrichtung überspringen
          </button>

          <ProgressDots currentStep={3} />

          <aside className={styles['mobile-quote']} aria-label="Leitprinzip">
            <span className={styles['mobile-quote-icon']} aria-hidden="true">
              <img src={wheelChairIcon} alt="" className={styles['mobile-quote-icon-image']} />
            </span>
            <span className={styles['mobile-quote-icon']} aria-hidden="true">
              <img src={lowVisionIcon} alt="" className={styles['mobile-quote-icon-image']} />
            </span>
            <span className={styles['mobile-quote-icon']} aria-hidden="true">
              <img src={hearingIcon} alt="" className={styles['mobile-quote-icon-image']} />
            </span>
            <span className={styles['mobile-quote-icon']} aria-hidden="true">
              <img src={limitedMobilityIcon} alt="" className={styles['mobile-quote-icon-image']} />
            </span>
            <span className={styles['mobile-quote-icon']} aria-hidden="true">
              <img src={confirmationIcon} alt="" className={styles['mobile-quote-icon-image']} />
            </span>
            <p className={styles['mobile-quote-text']}>
              "Unser Ziel ist eine 100% barrierefreie Vernetzung Europas."
            </p>
          </aside>
        </section>
      </div>
    </main>
  );
}
