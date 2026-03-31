import { useState } from 'react';
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
import styles from './OnboardingDesktop.module.css';

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

export default function OnboardingDesktop() {
  const [selectedOptionId, setSelectedOptionId] = useState<AccessibilityPreferenceId>('wheelchair');
  const navigate = useNavigate();
  const completeOnboardingAndOpenSearch = () => {
    storeAccessibilityPreference(selectedOptionId);
    storeCompletedOnboarding();
    void navigate({ to: '/' });
  };
  const skipOnboardingAndOpenSearch = () => {
    storeCompletedOnboarding();
    void navigate({ to: '/' });
  };

  return (
    <main className={styles.page}>
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
        </article>

        <article className={styles.panel} aria-labelledby="support-step-title">
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

          <p className={styles['info-strip']}>
            Ihre Auswahl optimiert automatische Suchergebnisse.
          </p>
        </article>

        <article className={styles.panel} aria-labelledby="done-step-title">
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

          <button
            type="button"
            className={styles['primary-button']}
            onClick={completeOnboardingAndOpenSearch}
          >
            Route finden
            <span aria-hidden="true" className={styles['arrow-icon']}>
              -&gt;
            </span>
          </button>

          <button
            type="button"
            className={styles['secondary-text-button']}
            onClick={skipOnboardingAndOpenSearch}
          >
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

      <footer className={styles.footer} aria-label="Seitenfuß">
        <div className={styles['footer-content']}>
          <h2 className={styles['footer-brand']}>Trans-Europe Line</h2>

          <nav className={styles['footer-nav']} aria-label="Footer Navigation">
            <a href="#datenschutz" className={styles['footer-link']}>
              Datenschutz
            </a>
            <a href="#impressum" className={styles['footer-link']}>
              Impressum
            </a>
            <a href="#kontakt" className={styles['footer-link']}>
              Kontakt
            </a>
            <a href="#nutzungsbedingungen" className={styles['footer-link']}>
              Nutzungsbedingungen
            </a>
          </nav>

          <p className={styles['footer-copyright']}>
            © 2026 trans-Europe line. Barrierefreies Reisen für alle.
          </p>
        </div>
      </footer>
    </main>
  );
}
