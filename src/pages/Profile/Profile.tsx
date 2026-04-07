import {
  Accessibility,
  Baby,
  Briefcase,
  Clock3,
  Eye,
  Home,
  Info,
  MapPin,
  UserRound,
} from 'lucide-react';
import { useState } from 'react';
import styles from './Profile.module.css';

type MobilityOption = {
  id: 'wheelchair' | 'stroller' | 'luggage' | 'visual-aid';
  label: string;
  Icon: typeof Accessibility;
};

type ComfortPreference = {
  id: 'avoid-stairs' | 'prefer-elevators' | 'low-floor-boarding';
  label: string;
};

type TransferPace = 'relaxed' | 'balanced' | 'fast';

const MOBILITY_OPTIONS: MobilityOption[] = [
  { id: 'wheelchair', label: 'Wheelchair', Icon: Accessibility },
  { id: 'stroller', label: 'Stroller', Icon: Baby },
  { id: 'luggage', label: 'Heavy Luggage', Icon: Briefcase },
  { id: 'visual-aid', label: 'Visual Aid', Icon: Eye },
];

const COMFORT_PREFERENCES: ComfortPreference[] = [
  { id: 'avoid-stairs', label: 'Avoid Stairs' },
  { id: 'prefer-elevators', label: 'Prefer Elevators' },
  { id: 'low-floor-boarding', label: 'Low-floor Boarding' },
];

const TRANSFER_PACE_OPTIONS: Array<{ id: TransferPace; label: string }> = [
  { id: 'relaxed', label: 'Relaxed' },
  { id: 'balanced', label: 'Balanced' },
  { id: 'fast', label: 'Fast' },
];

const SAVED_LOCATIONS = [
  {
    id: 'home',
    label: 'Home',
    detail: 'Kantstrasse 144, 10623 Berlin',
    Icon: Home,
  },
  {
    id: 'station',
    label: 'Berlin Hauptbahnhof',
    detail: 'Europaplatz 1, 10557 Berlin',
    Icon: MapPin,
  },
] as const;

const FOOTER_LINKS = [
  'The Editorial Navigator',
  'Privacy Policy',
  'Terms of Service',
  'Accessibility Statement',
  'Contact Support',
  '© 2024 The Editorial Navigator. High-End European Rail Mobility.',
] as const;

export default function Profile() {
  const [selectedMobility, setSelectedMobility] = useState<MobilityOption['id']>('wheelchair');
  const [walkDistance, setWalkDistance] = useState(450);
  const [transferPace, setTransferPace] = useState<TransferPace>('balanced');
  const [comfortPrefs, setComfortPrefs] = useState<Record<ComfortPreference['id'], boolean>>({
    'avoid-stairs': true,
    'prefer-elevators': true,
    'low-floor-boarding': false,
  });

  function toggleComfortPreference(id: ComfortPreference['id']) {
    setComfortPrefs((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Profile &amp; Mobility</h1>
          <p className={styles.subtitle}>
            Tailoring your European transit experience to your specific physical needs.
          </p>
        </div>
      </header>

      <div className={styles['desktop-grid']}>
        <div className={styles['left-column']}>
          <section aria-label="User profile" className={styles['profile-card']}>
            <div className={styles['profile-main-row']}>
              <div aria-hidden="true" className={styles.avatar}>
                <UserRound />
              </div>
              <div className={styles['profile-meta']}>
                <h2 className={styles['profile-name']}>Elena Schmidt</h2>
                <p className={styles['profile-badge']}>Gold Status</p>
              </div>
            </div>
            <div className={styles['profile-id-row']}>
              <span className={styles['profile-id-label']}>Traveler ID</span>
              <span className={styles['profile-id-value']}>DE - 9928 - LXB</span>
            </div>
          </section>

          <section aria-labelledby="mobility-heading" className={styles.section}>
            <div className={styles['section-heading-row']}>
              <h2 className={styles['section-label']} id="mobility-heading">
                Mobility Assistance
              </h2>
              <button
                aria-label="Mobility assistance info"
                className={styles['info-action']}
                type="button"
              >
                <Info aria-hidden="true" />
              </button>
            </div>

            <div className={styles['mobility-grid']}>
              {MOBILITY_OPTIONS.map((option) => {
                const isSelected = selectedMobility === option.id;

                return (
                  <button
                    key={option.id}
                    aria-pressed={isSelected}
                    className={styles['mobility-option']}
                    data-active={isSelected}
                    type="button"
                    onClick={() => {
                      setSelectedMobility(option.id);
                    }}
                  >
                    <option.Icon aria-hidden="true" className={styles['mobility-option-icon']} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="comfort-heading" className={styles.section}>
            <h2 className={styles['section-label']} id="comfort-heading">
              Travel Comfort
            </h2>

            <ul className={styles['toggle-list']}>
              {COMFORT_PREFERENCES.map((preference) => {
                const isEnabled = comfortPrefs[preference.id];

                return (
                  <li key={preference.id} className={styles['toggle-row']}>
                    <span className={styles['toggle-label']}>{preference.label}</span>
                    <button
                      role="switch"
                      aria-checked={isEnabled}
                      aria-label={preference.label}
                      className={styles['switch-button']}
                      data-active={isEnabled}
                      type="button"
                      onClick={() => {
                        toggleComfortPreference(preference.id);
                      }}
                    >
                      <span className={styles['switch-thumb']} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <div className={styles['right-column']}>
          <section className={styles['distance-card']}>
            <section aria-labelledby="distance-heading" className={styles.section}>
              <label
                className={styles['range-header']}
                htmlFor="walk-distance"
                id="distance-heading"
              >
                <span className={styles['range-title']}>Max Walking Distance</span>
                <output
                  aria-live="polite"
                  className={styles['range-value']}
                  htmlFor="walk-distance"
                >
                  {walkDistance}m
                </output>
              </label>
              <input
                id="walk-distance"
                aria-describedby="walk-distance-scale"
                className={styles['range-input']}
                max={1500}
                min={100}
                step={10}
                type="range"
                value={walkDistance}
                onChange={(event) => {
                  setWalkDistance(Number(event.target.value));
                }}
              />
              <div className={styles['range-scale']} id="walk-distance-scale">
                <span>100m</span>
                <span>1.5km</span>
              </div>
            </section>

            <section aria-labelledby="pace-heading" className={styles.section}>
              <h2 className={styles['range-title']} id="pace-heading">
                Transfer Pace
              </h2>
              <div aria-label="Transfer pace" className={styles['pace-group']} role="radiogroup">
                {TRANSFER_PACE_OPTIONS.map((option) => {
                  const isSelected = transferPace === option.id;

                  return (
                    <button
                      key={option.id}
                      role="radio"
                      aria-checked={isSelected}
                      className={styles['pace-option']}
                      data-active={isSelected}
                      type="button"
                      onClick={() => {
                        setTransferPace(option.id);
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <p className={styles['pace-help']}>
                Adjusts the minimum required time between connections to match your personal speed.
              </p>
            </section>
          </section>

          <section aria-labelledby="locations-heading" className={styles.section}>
            <div className={styles['section-heading-row']}>
              <h2 className={styles['section-label']} id="locations-heading">
                Saved Locations
              </h2>
              <button className={styles['add-location-link']} type="button">
                + Add New
              </button>
            </div>

            <ul className={styles['locations-list']}>
              {SAVED_LOCATIONS.map((location) => (
                <li key={location.id} className={styles['location-card']}>
                  <location.Icon aria-hidden="true" className={styles['location-icon']} />
                  <span className={styles['location-title']}>{location.label}</span>
                  <span className={styles['location-detail']}>{location.detail}</span>
                </li>
              ))}
            </ul>
          </section>

          <aside className={styles.notice}>
            <span aria-hidden="true" className={styles['db-badge']}>
              DB
            </span>
            <div className={styles['notice-content']}>
              <p className={styles['notice-title']}>Deutsche Bahn Data Sync</p>
              <p>
                Your mobility preferences are synchronized with your DB Navigator account. Changes
                here will automatically update your profile across all Trans-Europe Line partners.
              </p>
              <p className={styles['notice-meta']}>
                <Clock3 aria-hidden="true" /> Last synced: Today, 09:42 AM
              </p>
            </div>
          </aside>

          <button className={styles['save-button']} type="button">
            Save Preferences
          </button>
        </div>
      </div>

      <footer className={styles['desktop-footer']}>
        {FOOTER_LINKS.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </footer>
    </main>
  );
}
