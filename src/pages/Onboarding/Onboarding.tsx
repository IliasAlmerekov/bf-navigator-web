import { useEffect, useRef, useState } from 'react';
import { Baby } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import {
  ACCESSIBILITY_PREFERENCES,
  type AccessibilityPreferenceId,
} from '../../constants/accessibilityPreferences';
import wheelChairIcon from '../../assets/Onboarding/icons8-rollstuhl-26.png';
import lowVisionIcon from '../../assets/Onboarding/icons8-sehschwäche-48.png';
import hearingIcon from '../../assets/Onboarding/icons8-taub-67.png';
import limitedMobilityIcon from '../../assets/Onboarding/icons8-zugang-für-blinde-50.png';
import confirmationIcon from '../../assets/Onboarding/icons8-anerkennung-50.png';
import trainPhoto from '../../assets/Onboarding/ice taufe europa europe.webp';
import { storeAccessibilityPreference, storeCompletedOnboarding } from '../../utils/accountStorage';
import styles from './Onboarding.module.css';

type Step = 1 | 2 | 3;
const DESKTOP_BREAKPOINT_QUERY = '(min-width: 1024px)';

type MobilityOption = {
  Icon?: typeof Baby;
  iconSrc?: string;
  id: AccessibilityPreferenceId;
  subtitle: string;
  title: string;
};

const mobilityOptions: MobilityOption[] = [
  {
    ...ACCESSIBILITY_PREFERENCES[0],
    iconSrc: wheelChairIcon,
  },
  {
    ...ACCESSIBILITY_PREFERENCES[1],
    iconSrc: lowVisionIcon,
  },
  {
    ...ACCESSIBILITY_PREFERENCES[2],
    iconSrc: hearingIcon,
  },
  {
    ...ACCESSIBILITY_PREFERENCES[3],
    iconSrc: limitedMobilityIcon,
  },
  {
    ...ACCESSIBILITY_PREFERENCES[4],
    Icon: Baby,
  },
];

function getDesktopMatch() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia(DESKTOP_BREAKPOINT_QUERY).matches;
}

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
  const navigate = useNavigate();
  const [isDesktop, setIsDesktop] = useState<boolean>(getDesktopMatch);
  const [selectedOptionIds, setSelectedOptionIds] = useState<AccessibilityPreferenceId[]>([
    'wheelchair',
  ]);
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

  const handleSelectOption = (optionId: AccessibilityPreferenceId) => {
    setSelectedOptionIds([optionId]);

    if (optionId === 'vision') {
      scrollToStep(3);
    }
  };

  const completeOnboardingAndOpenSearch = () => {
    const selectedPreferenceId = selectedOptionIds[0];

    if (selectedPreferenceId) {
      storeAccessibilityPreference(selectedPreferenceId);
    }

    storeCompletedOnboarding();
    void navigate({ to: '/' });
  };

  const skipOnboardingAndOpenSearch = () => {
    storeCompletedOnboarding();
    void navigate({ to: '/' });
  };

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia(DESKTOP_BREAKPOINT_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  if (isDesktop) {
    const selectedOptionId = selectedOptionIds[0] ?? 'wheelchair';

    return (
      <main className={styles['desktop-page']}>
        <section className={styles['desktop-hero']} aria-labelledby="onboarding-title-desktop">
          <p className={styles['desktop-badge']}>ONBOARDING</p>
          <h1 id="onboarding-title-desktop" className={styles['desktop-h1']}>
            Ihre barrierefreie Reise
            <br />
            beginnt hier
          </h1>
          <p className={styles['desktop-subtitle']}>
            Wir gestalten Mobilität grenzenlos. Passen Sie Ihr Reiseerlebnis an Ihre Bedürfnisse an.
          </p>
        </section>

        <section className={styles['desktop-panels']} aria-label="Onboarding Schritte">
          <article className={styles['desktop-panel']} aria-labelledby="welcome-step-title">
            <div className={styles['desktop-step-heading-row']}>
              <span className={styles['desktop-step-index']} aria-hidden="true">
                1
              </span>
              <h2 id="welcome-step-title" className={styles['desktop-step-title']}>
                Willkommen
              </h2>
            </div>

            <img
              src={trainPhoto}
              alt="Moderner ICE-Zug am Bahnsteig"
              className={styles['desktop-welcome-image']}
            />
            <p className={styles['desktop-panel-copy']}>
              Willkommen an Bord der Trans-Europa Linie. Wir freuen uns, Sie auf Ihrem Weg durch
              Europa zu begleiten.
            </p>
          </article>

          <article className={styles['desktop-panel']} aria-labelledby="support-step-title">
            <div className={styles['desktop-step-heading-row']}>
              <span className={styles['desktop-step-index']} aria-hidden="true">
                2
              </span>
              <h2 id="support-step-title" className={styles['desktop-step-title']}>
                Wie können wir Sie unterstützen?
              </h2>
            </div>

            <ul className={styles['desktop-option-grid']} aria-label="Mobilitätsoptionen">
              {mobilityOptions.map((option) => {
                const isSelected = selectedOptionId === option.id;

                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      className={`${styles['desktop-option-tile']} ${isSelected ? styles['desktop-option-tile-selected'] : ''}`}
                      aria-pressed={isSelected}
                      onClick={() => handleSelectOption(option.id)}
                    >
                      <span className={styles['desktop-option-icon']} aria-hidden="true">
                        {option.iconSrc ? (
                          <img
                            src={option.iconSrc}
                            alt=""
                            className={styles['desktop-option-icon-image']}
                          />
                        ) : option.Icon ? (
                          <option.Icon className={styles['desktop-option-icon-image']} />
                        ) : null}
                      </span>
                      <span className={styles['desktop-option-content']}>
                        <span className={styles['desktop-option-title']}>{option.title}</span>
                        <span className={styles['desktop-option-subtitle']}>{option.subtitle}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <p className={styles['desktop-info-strip']}>
              Ihre Auswahl optimiert automatische Suchergebnisse.
            </p>
          </article>

          <article className={styles['desktop-panel']} aria-labelledby="done-step-title">
            <div className={styles['desktop-step-heading-row']}>
              <span className={styles['desktop-step-index']} aria-hidden="true">
                3
              </span>
              <h2 id="done-step-title" className={styles['desktop-step-title']}>
                Alles bereit
              </h2>
            </div>

            <div className={styles['desktop-success-circle']} aria-hidden="true">
              <span className={styles['desktop-success-inner-circle']}>
                <img
                  src={confirmationIcon}
                  alt=""
                  className={styles['desktop-confirmation-icon-image']}
                />
              </span>
            </div>

            <h3 className={styles['desktop-success-title']}>Profil konfiguriert</h3>
            <p className={styles['desktop-panel-copy']}>
              Wir haben Ihre Präferenzen gespeichert. Sie können nun Ihre erste barrierefreie Reise
              planen.
            </p>

            <p className={styles['desktop-status-chip']}>Schritt für Schritt barrierefrei</p>

            <button
              type="button"
              className={styles['desktop-primary-button']}
              onClick={completeOnboardingAndOpenSearch}
            >
              Route finden
              <span aria-hidden="true" className={styles['desktop-arrow-icon']}>
                -&gt;
              </span>
            </button>

            <button
              type="button"
              className={styles['desktop-secondary-text-button']}
              onClick={skipOnboardingAndOpenSearch}
            >
              Einrichtung überspringen
            </button>
          </article>
        </section>

        <aside className={styles['desktop-quote']} aria-label="Leitprinzip">
          <span className={styles['desktop-quote-icon']} aria-hidden="true">
            <img src={wheelChairIcon} alt="" className={styles['desktop-quote-icon-image']} />
          </span>
          <span className={styles['desktop-quote-icon']} aria-hidden="true">
            <img src={lowVisionIcon} alt="" className={styles['desktop-quote-icon-image']} />
          </span>
          <span className={styles['desktop-quote-icon']} aria-hidden="true">
            <img src={hearingIcon} alt="" className={styles['desktop-quote-icon-image']} />
          </span>
          <span className={styles['desktop-quote-icon']} aria-hidden="true">
            <img src={limitedMobilityIcon} alt="" className={styles['desktop-quote-icon-image']} />
          </span>
          <span className={styles['desktop-quote-icon']} aria-hidden="true">
            <img src={confirmationIcon} alt="" className={styles['desktop-quote-icon-image']} />
          </span>
          <p className={styles['desktop-quote-text']}>
            "Unser Ziel ist eine 100% barrierefreie Vernetzung Europas."
          </p>
        </aside>

        <footer className={styles['desktop-footer']} aria-label="Seitenfuß">
          <div className={styles['desktop-footer-content']}>
            <h2 className={styles['desktop-footer-brand']}>Trans-Europe Line</h2>

            <nav className={styles['desktop-footer-nav']} aria-label="Footer Navigation">
              <a href="#datenschutz" className={styles['desktop-footer-link']}>
                Datenschutz
              </a>
              <a href="#impressum" className={styles['desktop-footer-link']}>
                Impressum
              </a>
              <a href="#kontakt" className={styles['desktop-footer-link']}>
                Kontakt
              </a>
              <a href="#nutzungsbedingungen" className={styles['desktop-footer-link']}>
                Nutzungsbedingungen
              </a>
            </nav>

            <p className={styles['desktop-footer-copyright']}>
              © 2026 trans-Europe line. Barrierefreies Reisen für alle.
            </p>
          </div>
        </footer>
      </main>
    );
  }

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
                      {option.iconSrc ? (
                        <img src={option.iconSrc} alt="" className={styles['option-icon-image']} />
                      ) : option.Icon ? (
                        <option.Icon className={styles['option-icon-image']} />
                      ) : null}
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

          <button
            type="button"
            className={styles['primary-button']}
            onClick={completeOnboardingAndOpenSearch}
          >
            Route finden -&gt;
          </button>
          <button
            type="button"
            className={styles['secondary-button']}
            onClick={skipOnboardingAndOpenSearch}
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
