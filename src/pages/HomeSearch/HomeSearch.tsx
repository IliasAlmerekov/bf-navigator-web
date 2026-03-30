import { useRef, useState } from 'react';
import type React from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Accessibility,
  Baby,
  Bell,
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Eye,
  Luggage,
  Search,
  ShieldCheck,
  TrainFront,
} from 'lucide-react';
import alertActionImage from '../../assets/Home/alert.png';
import locationIconImage from '../../assets/Home/location.png';
import savedActionImage from '../../assets/Home/saved.png';
import trainHeroImage from '../../assets/Home/train.png';
import trainIconImage from '../../assets/Home/icon_train.png';
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

const PREFERENCES = [
  { label: 'Wheelchair', icon: Accessibility, active: false },
  { label: 'Stroller', icon: Baby, active: false },
  { label: 'Step-free Priority', icon: TrainFront, active: true },
  { label: 'Heavy Luggage', icon: Luggage, active: false },
  { label: 'Visual Assistance', icon: Eye, active: false },
] as const;

const QUICK_ACTIONS = [
  {
    title: 'Berlin → Hamburg',
    subtitle: 'ICE 784 · Preferred Platform 4',
    cta: 'View Schedule',
    icon: savedActionImage,
    iconAlt: '',
    eyebrow: 'Saved Journey',
    mobileLabel: 'Saved Trips',
  },
  {
    title: 'Berlin Friedrichstraße',
    subtitle: '350m · Step-free access verified',
    cta: 'Open Map',
    icon: trainIconImage,
    iconAlt: '',
    eyebrow: 'Nearby Station',
    mobileLabel: 'Nearby Stations',
  },
  {
    title: 'Alerts',
    subtitle: 'Platform changes and disruptions tailored to your route.',
    cta: 'Open Alerts',
    icon: alertActionImage,
    iconAlt: '',
    eyebrow: 'Live Notices',
    mobileLabel: 'Alerts',
  },
] as const;

const LIVE_DATA_POINTS = ['Real-time lift status', 'Accurate platform info', 'Delay notifications'];

export default function HomeSearch() {
  const navigate = useNavigate();
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitInFlightRef.current) {
      return;
    }

    const errors: FormErrors = {
      origin:
        routeState.origin.selectedStation === null
          ? 'Please select an origin station from the suggestions.'
          : null,
      destination:
        routeState.destination.selectedStation === null
          ? 'Please select a destination station from the suggestions.'
          : null,
      date: dateValue === '' ? 'Please select a departure date.' : null,
      time: timeValue === '' ? 'Please select a departure time.' : null,
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
          <button aria-label="Notifications" className={styles['icon-button']} type="button">
            <Bell aria-hidden="true" />
          </button>
          <button aria-label="Profile" className={styles['icon-button']} type="button">
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
            Redefining European transit through editorial clarity and inclusive design. Every
            journey, simplified for everyone.
          </p>
        </div>

        <div className={styles['desktop-image-wrap']}>
          <img
            alt="High-speed train travelling through the countryside"
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
          Home search
        </h2>

        <form aria-busy={isSubmitting} className={styles['search-card']} onSubmit={handleSubmit}>
          {isSubmitting ? (
            <p aria-live="polite" className={styles['sr-only']}>
              Loading train results.
            </p>
          ) : null}

          <div className={styles['mobile-search-grid']}>
            <StationAutocompleteField
              errorId="origin-error-mobile"
              hasSearched={originSuggestions.hasSearched}
              iconAlt=""
              iconSrc={locationIconImage}
              inputId="origin-mobile"
              inputName="origin-mobile"
              invalid={formErrors.origin !== null}
              isActive={activeAutocompleteId === 'origin-mobile'}
              label="From"
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
            <StationAutocompleteField
              errorId="destination-error-mobile"
              hasSearched={destinationSuggestions.hasSearched}
              iconAlt=""
              iconSrc={locationIconImage}
              inputId="destination-mobile"
              inputName="destination-mobile"
              invalid={formErrors.destination !== null}
              isActive={activeAutocompleteId === 'destination-mobile'}
              label="To"
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

            <div className={styles['date-time-wrapper']}>
              <label className={styles['date-time-field']} htmlFor="date-mobile">
                <CalendarDays aria-hidden="true" className={styles['field-icon']} />
                <span className={styles['field-label']}>Date</span>
                <input
                  aria-describedby={formErrors.date ? 'date-error-mobile' : undefined}
                  aria-invalid={formErrors.date !== null}
                  className={styles['date-input']}
                  id="date-mobile"
                  name="date-mobile"
                  onChange={(e) => {
                    setDateValue(e.target.value);
                    setFormErrors((current) => ({ ...current, date: null }));
                  }}
                  type="date"
                  value={dateValue}
                />
              </label>
              {formErrors.date ? (
                <p className={styles['field-error']} id="date-error-mobile" role="alert">
                  {formErrors.date}
                </p>
              ) : null}
            </div>

            <div className={styles['date-time-wrapper']}>
              <label className={styles['date-time-field']} htmlFor="time-mobile">
                <Clock3 aria-hidden="true" className={styles['field-icon']} />
                <span className={styles['field-label']}>Time</span>
                <input
                  aria-describedby={formErrors.time ? 'time-error-mobile' : undefined}
                  aria-invalid={formErrors.time !== null}
                  className={styles['date-input']}
                  id="time-mobile"
                  name="time-mobile"
                  onChange={(e) => {
                    setTimeValue(e.target.value);
                    setFormErrors((current) => ({ ...current, time: null }));
                  }}
                  type="time"
                  value={timeValue}
                />
              </label>
              {formErrors.time ? (
                <p className={styles['field-error']} id="time-error-mobile" role="alert">
                  {formErrors.time}
                </p>
              ) : null}
            </div>
          </div>

          <div className={styles['desktop-search-grid']}>
            <StationAutocompleteField
              errorId="origin-error-desktop"
              hasSearched={originSuggestions.hasSearched}
              iconAlt=""
              iconSrc={locationIconImage}
              inputId="origin-desktop"
              inputName="origin-desktop"
              invalid={formErrors.origin !== null}
              isActive={activeAutocompleteId === 'origin-desktop'}
              label="From"
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
            <StationAutocompleteField
              Icon={TrainFront}
              errorId="destination-error-desktop"
              hasSearched={destinationSuggestions.hasSearched}
              inputId="destination-desktop"
              inputName="destination-desktop"
              invalid={formErrors.destination !== null}
              isActive={activeAutocompleteId === 'destination-desktop'}
              label="To"
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

            <div className={styles['date-time-wrapper']}>
              <label className={styles['date-time-field']} htmlFor="date-desktop">
                <CalendarDays aria-hidden="true" className={styles['field-icon']} />
                <span className={styles['field-label']}>Date</span>
                <input
                  aria-describedby={formErrors.date ? 'date-error-desktop' : undefined}
                  aria-invalid={formErrors.date !== null}
                  className={styles['date-input']}
                  id="date-desktop"
                  name="date-desktop"
                  onChange={(e) => {
                    setDateValue(e.target.value);
                    setFormErrors((current) => ({ ...current, date: null }));
                  }}
                  type="date"
                  value={dateValue}
                />
              </label>
              {formErrors.date ? (
                <p className={styles['field-error']} id="date-error-desktop" role="alert">
                  {formErrors.date}
                </p>
              ) : null}
            </div>

            <div className={styles['date-time-wrapper']}>
              <label className={styles['date-time-field']} htmlFor="time-desktop">
                <Clock3 aria-hidden="true" className={styles['field-icon']} />
                <span className={styles['field-label']}>Time</span>
                <input
                  aria-describedby={formErrors.time ? 'time-error-desktop' : undefined}
                  aria-invalid={formErrors.time !== null}
                  className={styles['date-input']}
                  id="time-desktop"
                  name="time-desktop"
                  onChange={(e) => {
                    setTimeValue(e.target.value);
                    setFormErrors((current) => ({ ...current, time: null }));
                  }}
                  type="time"
                  value={timeValue}
                />
              </label>
              {formErrors.time ? (
                <p className={styles['field-error']} id="time-error-desktop" role="alert">
                  {formErrors.time}
                </p>
              ) : null}
            </div>

            <button
              aria-label="Find route"
              className={styles['search-submit']}
              disabled={isSubmitting}
              type="submit"
            >
              <Search aria-hidden="true" />
            </button>
          </div>

          <section aria-labelledby="travel-preferences-heading" className={styles.preferences}>
            <div className={styles['preferences-header']}>
              <h2 id="travel-preferences-heading">Travel Preferences</h2>
            </div>

            <div className={styles['preferences-grid']}>
              {PREFERENCES.map((preference) => (
                <button
                  key={preference.label}
                  aria-pressed={preference.active}
                  className={styles['preference-chip']}
                  data-active={preference.active}
                  type="button"
                >
                  <preference.icon aria-hidden="true" className={styles['preference-icon']} />
                  <span>{preference.label}</span>
                </button>
              ))}
            </div>
          </section>

          <button className={styles['primary-action']} disabled={isSubmitting} type="submit">
            <span>Find Optimal Route</span>
            <Search aria-hidden="true" />
          </button>
        </form>

        <article className={styles['mobile-live-card']}>
          <div className={styles['db-badge']} aria-hidden="true">
            DB
          </div>
          <div className={styles['live-card-copy']}>
            <p className={styles['live-card-title']}>Verified Deutsche Bahn Data Live</p>
            <p className={styles['live-card-text']}>
              Live status for elevators and station equipment updated every 60 seconds.
            </p>
          </div>
        </article>
      </section>

      <section aria-labelledby="quick-actions-heading" className={styles['quick-actions']}>
        <div className={styles['section-heading-row']}>
          <h2 id="quick-actions-heading">Quick Actions</h2>
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

              <button className={styles['quick-card-link']} type="button">
                <span>{action.cta}</span>
                <ChevronRight aria-hidden="true" />
              </button>
            </article>
          ))}

          <article className={styles['live-data-card']}>
            <div className={styles['live-data-top']}>
              <ShieldCheck aria-hidden="true" className={styles['live-data-badge']} />
              <div>
                <p className={styles['live-data-kicker']}>Verified Live Data</p>
                <h3>Verified Live Data</h3>
              </div>
            </div>

            <p className={styles['live-data-text']}>
              Direct connection with Deutsche Bahn API ensures you have the most accurate,
              up-to-the-minute information on platform changes and lift accessibility.
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
            <button key={action.title} className={styles['mobile-action-pill']} type="button">
              <img
                alt={action.iconAlt}
                className={styles['mobile-action-icon']}
                src={action.icon}
              />
              <span>{action.mobileLabel}</span>
            </button>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <div>
          <p className={styles['footer-brand']}>BF-Navigator</p>
          <p className={styles['footer-copy']}>
            Barrier-free travel with editorial calm for every connection.
          </p>
        </div>

        <nav aria-label="Footer" className={styles['footer-links']}>
          <button type="button">Privacy Policy</button>
          <button type="button">Terms of Service</button>
          <button type="button">Station Maps</button>
          <button type="button">Contact Support</button>
        </nav>
      </footer>
    </main>
  );
}
