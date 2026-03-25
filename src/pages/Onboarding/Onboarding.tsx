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
  const [allowMultiple, setAllowMultiple] = useState(false);
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
    setSelectedOptionIds((previousSelected) => {
      if (!allowMultiple) {
        return [optionId];
      }

      if (previousSelected.includes(optionId)) {
        const reduced = previousSelected.filter((id) => id !== optionId);
        return reduced.length > 0 ? reduced : previousSelected;
      }

      return [...previousSelected, optionId];
    });
  };

  const handleToggleMultiple = () => {
    setAllowMultiple((previous) => {
      const next = !previous;
      if (!next && selectedOptionIds.length > 1) {
        setSelectedOptionIds([selectedOptionIds[0]]);
      }
      return next;
    });
  };

  return (
    <main className={styles.page}>
      <div className={styles.column}>
        <section ref={stepOneRef} className={styles.block} aria-labelledby="onboarding-title">
          <div className={styles['brand-row']}>
            <span className={styles['brand-text']}>BF NAVIGATURE</span>
            <span className={styles['locale-tag']}>DE</span>
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
            Intercity-Reisen,
            <br />
            angepasst an Ihre Bedürfnisse
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
          <p className={styles.eyebrow}>SCHRITT 2 VON 3 · MOBILITÄTSPROFIL</p>
          <h2 id="support-title" className={styles.h2}>
            Wie können wir Sie unterstützen?
          </h2>

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

          <button
            type="button"
            className={styles['text-action-button']}
            onClick={handleToggleMultiple}
          >
            {allowMultiple ? 'Mehrfachauswahl: An' : 'Mehrfachauswahl'}
          </button>

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

        <section ref={stepThreeRef} className={styles.block} aria-labelledby="ready-title">
          <div className={styles['success-circle']} aria-hidden="true">
            <span className={styles['success-inner-circle']}>
              <img src={confirmationIcon} alt="" className={styles['confirmation-icon-image']} />
            </span>
          </div>

          <h2 id="ready-title" className={styles.h2}>
            Alles bereit.
          </h2>
          <p className={styles['body-copy']}>
            Ihr Profil wurde gespeichert. Wir schlagen Ihnen nur passende Routen vor.
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
        </section>
      </div>
    </main>
  );
}
