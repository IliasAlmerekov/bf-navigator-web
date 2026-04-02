import { useRef, useState } from 'react';
import type React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  Accessibility,
  Baby,
  Bell,
  ChevronRight,
  CircleUserRound,
  Eye,
  Search,
  ShieldCheck,
  TrainFront,
} from 'lucide-react';
import { CalendarDatePicker } from '../../components/ui/CalendarDatePicker';
import { TimePicker } from '../../components/ui/TimePicker';
import alertActionImage from '../../assets/Home/alert.png';
import locationIconImage from '../../assets/Home/location.png';
import savedActionImage from '../../assets/Home/saved.png';
import trainHeroImage from '../../assets/Home/train.png';
import trainIconImage from '../../assets/Home/icon_train.png';
import {
  ACCESSIBILITY_PREFERENCES,
  type AccessibilityPreferenceId,
} from '../../constants/accessibilityPreferences';
import {
  clearStoredAccessibilityPreference,
  getStoredAccessibilityPreference,
  storeAccessibilityPreference,
} from '../../utils/accountStorage';
import { StationAutocompleteField } from './components/StationAutocompleteField';
import { useStationSuggestions } from './hooks/useStationSuggestions';
import type { FieldKey, StationSuggestion } from './types';
import styles from './HomeSearch.module.css';

type RouteFieldState = {
  input: string;
  selectedStation: StationSuggestion | null;
};

type FormErrors = {
  origin: string | null;
  destination: string | null;
  date: string | null;
  time: string | null;
};

const INITIAL_ROUTE_STATE: Record<FieldKey, RouteFieldState> = {
  destination: {
    input: 'München Hbf',
    selectedStation: null,
  },
  origin: {
    input: 'Berlin Hbf',
    selectedStation: null,
  },
};

const preferenceIcons: Record<AccessibilityPreferenceId, typeof Accessibility> = {
  hearing: Bell,
  mobility: TrainFront,
  stroller: Baby,
  vision: Eye,
  wheelchair: Accessibility,
};

const QUICK_ACTIONS = [
  {
    title: 'Berlin → Hamburg',
    subtitle: 'ICE 784 · Bevorzugter Bahnsteig 4',
    cta: 'Fahrplan ansehen',
    to: '/saved-trips',
    icon: savedActionImage,
    iconAlt: '',
    eyebrow: 'Gespeicherte Reise',
    mobileLabel: 'Gespeicherte Reisen',
  },
  {
    title: 'Berlin Friedrichstraße',
    subtitle: '350 m · Stufenfreier Zugang bestätigt',
    cta: 'Karte öffnen',
    to: '/station-accessibility',
    icon: trainIconImage,
    iconAlt: '',
    eyebrow: 'Bahnhof in der Nähe',
    mobileLabel: 'Bahnhöfe in der Nähe',
  },
  {
    title: 'Meldungen',
    subtitle: 'Bahnsteigwechsel und Störungen passend zu Ihrer Route.',
    cta: 'Meldungen öffnen',
    to: '/alerts',
    icon: alertActionImage,
    iconAlt: '',
    eyebrow: 'Live-Hinweise',
    mobileLabel: 'Meldungen',
  },
] as const;

const LIVE_DATA_POINTS = [
  'Echtzeitstatus der Aufzüge',
  'Genaue Bahnsteiginformationen',
  'Verspätungsmeldungen',
];

export default function HomeSearch() {
  const navigate = useNavigate();
  const [selectedPreferenceId, setSelectedPreferenceId] =
    useState<AccessibilityPreferenceId | null>(getStoredAccessibilityPreference);
  const [routeState, setRouteState] = useState(INITIAL_ROUTE_STATE);
  const [activeField, setActiveField] = useState<FieldKey | null>(null);
  const [activeAutocompleteId, setActiveAutocompleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitInFlightRef = useRef(false);
  const [dateValue, setDateValue] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [timeValue, setTimeValue] = useState('09:00');
  const [formErrors, setFormErrors] = useState<FormErrors>({
    origin: null,
    destination: null,
    date: null,
    time: null,
  });

  const originSuggestions = useStationSuggestions(
    routeState.origin.input,
    activeField === 'origin'
  );
  const destinationSuggestions = useStationSuggestions(
    routeState.destination.input,
    activeField === 'destination'
  );

  function handleFieldInputChange(fieldKey: FieldKey, value: string) {
    setRouteState((currentState) => ({
      ...currentState,
      [fieldKey]: {
        input: value,
        selectedStation: null,
      },
    }));
    setFormErrors((current) => ({ ...current, [fieldKey]: null }));
  }

  function handleStationSelect(fieldKey: FieldKey, station: StationSuggestion) {
    setRouteState((currentState) => ({
      ...currentState,
      [fieldKey]: {
        input: station.name,
        selectedStation: station,
      },
    }));
    setFormErrors((current) => ({ ...current, [fieldKey]: null }));
  }

  function handleActiveAutocompleteChange(
    fieldKey: FieldKey,
    autocompleteId: string,
    nextActive: boolean
  ) {
    if (nextActive) {
      setActiveField(fieldKey);
      setActiveAutocompleteId(autocompleteId);
      return;
    }

    setActiveField((currentField) => (currentField === fieldKey ? null : currentField));
    setActiveAutocompleteId((currentAutocompleteId) =>
      currentAutocompleteId === autocompleteId ? null : currentAutocompleteId
    );
  }

  function handlePreferenceSelect(preferenceId: AccessibilityPreferenceId) {
    setSelectedPreferenceId((currentPreferenceId) => {
      if (currentPreferenceId === preferenceId) {
        clearStoredAccessibilityPreference();
        return null;
      }

      storeAccessibilityPreference(preferenceId);
      return preferenceId;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitInFlightRef.current) {
      return;
    }

    const errors: FormErrors = {
      origin:
        routeState.origin.selectedStation === null
          ? 'Bitte wählen Sie einen Startbahnhof aus den Vorschlägen aus.'
          : null,
      destination:
        routeState.destination.selectedStation === null
          ? 'Bitte wählen Sie einen Zielbahnhof aus den Vorschlägen aus.'
          : null,
      date: dateValue === '' ? 'Bitte wählen Sie ein Reisedatum aus.' : null,
      time: timeValue === '' ? 'Bitte wählen Sie eine Uhrzeit aus.' : null,
    };

    setFormErrors(errors);

    if (Object.values(errors).some((e) => e !== null)) return;

    const originStation = routeState.origin.selectedStation;
    const destinationStation = routeState.destination.selectedStation;

    if (!originStation || !destinationStation) {
      return;
    }

    submitInFlightRef.current = true;
    setIsSubmitting(true);

    try {
      await navigate({
        search: {
          accessibilityPreference: selectedPreferenceId ?? '',
          date: dateValue,
          destinationEva: String(destinationStation.evaNumber),
          destinationName: destinationStation.name,
          originEva: String(originStation.evaNumber),
          originName: originStation.name,
          time: timeValue,
        },
        to: '/train-search-results',
      });
    } finally {
      submitInFlightRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles['mobile-topbar']}>
        <p className={styles.brand}>BF-Navigator</p>
        <div className={styles['mobile-topbar-actions']}>
          <button aria-label="Benachrichtigungen" className={styles['icon-button']} type="button">
            <Bell aria-hidden="true" />
          </button>
          <button aria-label="Profil" className={styles['icon-button']} type="button">
            <CircleUserRound aria-hidden="true" />
          </button>
        </div>
      </header>

      <section className={styles['desktop-hero']}>
        <div className={styles['desktop-copy']}>
          <h1 className={styles.title}>
            Travel across cities
            <span>without barriers.</span>
          </h1>
          <p className={styles.lead}>
            Europäische Mobilität neu gedacht: mit klarer Orientierung, inklusivem Design und einer
            Reiseplanung, die für alle verständlich bleibt.
          </p>
        </div>

        <div className={styles['desktop-image-wrap']}>
          <img
            alt="Hochgeschwindigkeitszug auf der Fahrt durch die Landschaft"
            className={styles['desktop-image']}
            src={trainHeroImage}
          />
        </div>
      </section>

      <section className={styles['mobile-hero']}>
        <img alt="" className={styles['mobile-hero-image']} src={trainHeroImage} />
      </section>

      <section aria-labelledby="home-search-heading" className={styles['search-shell']}>
        <h2 className={styles['sr-only']} id="home-search-heading">
          Startsuche
        </h2>

        <form aria-busy={isSubmitting} className={styles['search-card']} onSubmit={handleSubmit}>
          {isSubmitting ? (
            <p aria-live="polite" className={styles['sr-only']}>
              Zugverbindungen werden geladen.
            </p>
          ) : null}

          <div className={styles['mobile-search-grid']}>
            <div className={styles['field-wrap']}>
              <StationAutocompleteField
                errorId="origin-error-mobile"
                hasSearched={originSuggestions.hasSearched}
                iconAlt=""
                iconSrc={locationIconImage}
                inputId="origin-mobile"
                inputName="origin-mobile"
                invalid={formErrors.origin !== null}
                isActive={activeAutocompleteId === 'origin-mobile'}
                label="Von"
                loading={originSuggestions.loading}
                onActiveChange={(nextActive) => {
                  handleActiveAutocompleteChange('origin', 'origin-mobile', nextActive);
                }}
                onInputChange={(value) => {
                  handleFieldInputChange('origin', value);
                }}
                onStationSelect={(station) => {
                  handleStationSelect('origin', station);
                }}
                suggestions={originSuggestions.suggestions}
                value={routeState.origin.input}
                variant="mobile"
                error={originSuggestions.error}
              />
              {formErrors.origin ? (
                <p className={styles['field-error']} id="origin-error-mobile" role="alert">
                  {formErrors.origin}
                </p>
              ) : null}
            </div>
            <div className={styles['field-wrap']}>
              <StationAutocompleteField
                errorId="destination-error-mobile"
                hasSearched={destinationSuggestions.hasSearched}
                iconAlt=""
                iconSrc={locationIconImage}
                inputId="destination-mobile"
                inputName="destination-mobile"
                invalid={formErrors.destination !== null}
                isActive={activeAutocompleteId === 'destination-mobile'}
                label="Nach"
                loading={destinationSuggestions.loading}
                onActiveChange={(nextActive) => {
                  handleActiveAutocompleteChange('destination', 'destination-mobile', nextActive);
                }}
                onInputChange={(value) => {
                  handleFieldInputChange('destination', value);
                }}
                onStationSelect={(station) => {
                  handleStationSelect('destination', station);
                }}
                suggestions={destinationSuggestions.suggestions}
                value={routeState.destination.input}
                variant="mobile"
                error={destinationSuggestions.error}
              />
              {formErrors.destination ? (
                <p className={styles['field-error']} id="destination-error-mobile" role="alert">
                  {formErrors.destination}
                </p>
              ) : null}
            </div>

            <div className={styles['date-time-wrapper']}>
              <CalendarDatePicker
                describedBy={formErrors.date ? 'date-error-mobile' : undefined}
                invalid={formErrors.date !== null}
                label="Date"
                onChange={(nextDate) => {
                  setDateValue(nextDate);
                  setFormErrors((current) => ({ ...current, date: null }));
                }}
                value={dateValue}
              />
              {formErrors.date ? (
                <p className={styles['field-error']} id="date-error-mobile" role="alert">
                  {formErrors.date}
                </p>
              ) : null}
            </div>

            <div className={styles['date-time-wrapper']}>
              <TimePicker
                describedBy={formErrors.time ? 'time-error-mobile' : undefined}
                invalid={formErrors.time !== null}
                label="Time"
                onChange={(nextTime) => {
                  setTimeValue(nextTime);
                  setFormErrors((current) => ({ ...current, time: null }));
                }}
                value={timeValue}
              />
              {formErrors.time ? (
                <p className={styles['field-error']} id="time-error-mobile" role="alert">
                  {formErrors.time}
                </p>
              ) : null}
            </div>
          </div>

          <div className={styles['desktop-search-grid']}>
            <div className={styles['field-wrap']}>
              <StationAutocompleteField
                errorId="origin-error-desktop"
                hasSearched={originSuggestions.hasSearched}
                iconAlt=""
                iconSrc={locationIconImage}
                inputId="origin-desktop"
                inputName="origin-desktop"
                invalid={formErrors.origin !== null}
                isActive={activeAutocompleteId === 'origin-desktop'}
                label="Von"
                loading={originSuggestions.loading}
                onActiveChange={(nextActive) => {
                  handleActiveAutocompleteChange('origin', 'origin-desktop', nextActive);
                }}
                onInputChange={(value) => {
                  handleFieldInputChange('origin', value);
                }}
                onStationSelect={(station) => {
                  handleStationSelect('origin', station);
                }}
                suggestions={originSuggestions.suggestions}
                value={routeState.origin.input}
                variant="desktop"
                error={originSuggestions.error}
              />
              {formErrors.origin ? (
                <p className={styles['field-error']} id="origin-error-desktop" role="alert">
                  {formErrors.origin}
                </p>
              ) : null}
            </div>
            <div className={styles['field-wrap']}>
              <StationAutocompleteField
                Icon={TrainFront}
                errorId="destination-error-desktop"
                hasSearched={destinationSuggestions.hasSearched}
                inputId="destination-desktop"
                inputName="destination-desktop"
                invalid={formErrors.destination !== null}
                isActive={activeAutocompleteId === 'destination-desktop'}
                label="Nach"
                loading={destinationSuggestions.loading}
                onActiveChange={(nextActive) => {
                  handleActiveAutocompleteChange('destination', 'destination-desktop', nextActive);
                }}
                onInputChange={(value) => {
                  handleFieldInputChange('destination', value);
                }}
                onStationSelect={(station) => {
                  handleStationSelect('destination', station);
                }}
                suggestions={destinationSuggestions.suggestions}
                value={routeState.destination.input}
                variant="desktop"
                error={destinationSuggestions.error}
              />
              {formErrors.destination ? (
                <p className={styles['field-error']} id="destination-error-desktop" role="alert">
                  {formErrors.destination}
                </p>
              ) : null}
            </div>

            <div className={styles['date-time-wrapper']}>
              <CalendarDatePicker
                describedBy={formErrors.date ? 'date-error-desktop' : undefined}
                invalid={formErrors.date !== null}
                label="Date"
                onChange={(nextDate) => {
                  setDateValue(nextDate);
                  setFormErrors((current) => ({ ...current, date: null }));
                }}
                value={dateValue}
              />
              {formErrors.date ? (
                <p className={styles['field-error']} id="date-error-desktop" role="alert">
                  {formErrors.date}
                </p>
              ) : null}
            </div>

            <div className={styles['date-time-wrapper']}>
              <TimePicker
                describedBy={formErrors.time ? 'time-error-desktop' : undefined}
                invalid={formErrors.time !== null}
                label="Time"
                onChange={(nextTime) => {
                  setTimeValue(nextTime);
                  setFormErrors((current) => ({ ...current, time: null }));
                }}
                value={timeValue}
              />
              {formErrors.time ? (
                <p className={styles['field-error']} id="time-error-desktop" role="alert">
                  {formErrors.time}
                </p>
              ) : null}
            </div>

            <button
              aria-label="Route suchen"
              className={styles['search-submit']}
              disabled={isSubmitting}
              type="submit"
            >
              <Search aria-hidden="true" />
            </button>
          </div>

          <section aria-labelledby="travel-preferences-heading" className={styles.preferences}>
            <div className={styles['preferences-header']}>
              <h2 id="travel-preferences-heading">Reisepräferenzen</h2>
            </div>

            <div className={styles['preferences-grid']}>
              {ACCESSIBILITY_PREFERENCES.map((preference) => {
                const Icon = preferenceIcons[preference.id];
                const isActive = selectedPreferenceId === preference.id;

                return (
                  <button
                    key={preference.id}
                    aria-pressed={isActive}
                    className={styles['preference-chip']}
                    data-active={isActive}
                    onClick={() => handlePreferenceSelect(preference.id)}
                    type="button"
                  >
                    <Icon aria-hidden="true" className={styles['preference-icon']} />
                    <span>{preference.title}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <button className={styles['primary-action']} disabled={isSubmitting} type="submit">
            <span>Optimale Route finden</span>
            <Search aria-hidden="true" />
          </button>
        </form>

        <article className={styles['mobile-live-card']}>
          <div className={styles['db-badge']} aria-hidden="true">
            DB
          </div>
          <div className={styles['live-card-copy']}>
            <p className={styles['live-card-title']}>Verifizierte Deutsche-Bahn-Livedaten</p>
            <p className={styles['live-card-text']}>
              Live-Status für Aufzüge und Bahnhofsausstattung, alle 60 Sekunden aktualisiert.
            </p>
          </div>
        </article>
      </section>

      <section aria-labelledby="quick-actions-heading" className={styles['quick-actions']}>
        <div className={styles['section-heading-row']}>
          <h2 id="quick-actions-heading">Schnellzugriffe</h2>
        </div>

        <div className={styles['quick-actions-grid']}>
          {QUICK_ACTIONS.slice(0, 2).map((action) => (
            <article key={action.title} className={styles['quick-card']}>
              <div className={styles['quick-card-top']}>
                <div className={styles['quick-card-icon-wrap']}>
                  <img
                    alt={action.iconAlt}
                    className={styles['quick-card-icon']}
                    src={action.icon}
                  />
                </div>
                <p className={styles['quick-card-eyebrow']}>{action.eyebrow}</p>
              </div>

              <div className={styles['quick-card-body']}>
                <h3>{action.title}</h3>
                <p>{action.subtitle}</p>
              </div>

              <Link className={styles['quick-card-link']} to={action.to}>
                <span>{action.cta}</span>
                <ChevronRight aria-hidden="true" />
              </Link>
            </article>
          ))}

          <article className={styles['live-data-card']}>
            <div className={styles['live-data-top']}>
              <ShieldCheck aria-hidden="true" className={styles['live-data-badge']} />
              <div>
                <p className={styles['live-data-kicker']}>Verified Live Data</p>
                <h3>Verifizierte Livedaten</h3>
              </div>
            </div>

            <p className={styles['live-data-text']}>
              Die direkte Anbindung an die Deutsche-Bahn-API liefert Ihnen präzise und aktuelle
              Informationen zu Bahnsteigwechseln und zur Aufzugsverfügbarkeit.
            </p>

            <ul className={styles['live-data-list']}>
              {LIVE_DATA_POINTS.map((item) => (
                <li key={item}>
                  <ShieldCheck aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className={styles['mobile-actions-row']}>
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.title} className={styles['mobile-action-pill']} to={action.to}>
              <img
                alt={action.iconAlt}
                className={styles['mobile-action-icon']}
                src={action.icon}
              />
              <span>{action.mobileLabel}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
