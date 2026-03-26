import { useState } from 'react';
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
import type { LucideIcon } from 'lucide-react';
import alertActionImage from '../../assets/Home/alert.png';
import locationIconImage from '../../assets/Home/location.png';
import savedActionImage from '../../assets/Home/saved.png';
import trainHeroImage from '../../assets/Home/train.png';
import trainIconImage from '../../assets/Home/icon_train.png';
import { StationAutocompleteField } from './components/StationAutocompleteField';
import { useStationSuggestions } from './hooks/useStationSuggestions';
import styles from './HomeSearch.module.css';
import type { FieldKey, StationSuggestion } from './types';

type SearchField =
  | {
      name: string;
      label: string;
      value: string;
      iconSrc: string;
      iconAlt: string;
      autoComplete?: string;
    }
  | {
      name: string;
      label: string;
      value: string;
      icon: LucideIcon;
      autoComplete?: string;
    };

type RouteFieldState = {
  input: string;
  selectedStation: StationSuggestion | null;
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

const MOBILE_STATIC_SEARCH_FIELDS: SearchField[] = [
  { name: 'date-mobile', label: 'Date', value: 'Tomorrow, 14 Oct', icon: CalendarDays },
  { name: 'time-mobile', label: 'Time', value: '09:30 AM', icon: Clock3 },
] as const;

const DESKTOP_STATIC_SEARCH_FIELDS: SearchField[] = [
  { name: 'date-desktop', label: 'Date', value: 'Tomorrow', icon: CalendarDays },
  { name: 'time-desktop', label: 'Time', value: '09:30', icon: Clock3 },
] as const;

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

function renderFieldIcon(field: SearchField) {
  if ('iconSrc' in field) {
    return <img alt={field.iconAlt} className={styles['field-image-icon']} src={field.iconSrc} />;
  }

  const Icon = field.icon;

  return <Icon aria-hidden="true" className={styles['field-icon']} />;
}

function SearchFieldControl({ field }: { field: SearchField }) {
  return (
    <label className={styles['search-field']}>
      {renderFieldIcon(field)}
      <span className={styles['field-label']}>{field.label}</span>
      <input
        aria-label={field.label}
        autoComplete={field.autoComplete}
        className={styles['search-input']}
        defaultValue={field.value}
        name={field.name}
        type="text"
      />
    </label>
  );
}

export default function HomeSearch() {
  const [routeState, setRouteState] = useState(INITIAL_ROUTE_STATE);
  const [activeField, setActiveField] = useState<FieldKey | null>(null);
  const [activeAutocompleteId, setActiveAutocompleteId] = useState<string | null>(null);

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
  }

  function handleStationSelect(fieldKey: FieldKey, station: StationSuggestion) {
    setRouteState((currentState) => ({
      ...currentState,
      [fieldKey]: {
        input: station.name,
        selectedStation: station,
      },
    }));
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

        <form
          className={styles['search-card']}
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <div className={styles['mobile-search-grid']}>
            <StationAutocompleteField
              hasSearched={originSuggestions.hasSearched}
              iconAlt=""
              iconSrc={locationIconImage}
              inputId="origin-mobile"
              inputName="origin-mobile"
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
            <StationAutocompleteField
              hasSearched={destinationSuggestions.hasSearched}
              iconAlt=""
              iconSrc={locationIconImage}
              inputId="destination-mobile"
              inputName="destination-mobile"
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
            {MOBILE_STATIC_SEARCH_FIELDS.map((field) => (
              <SearchFieldControl key={field.name} field={field} />
            ))}
          </div>

          <div className={styles['desktop-search-grid']}>
            <StationAutocompleteField
              hasSearched={originSuggestions.hasSearched}
              iconAlt=""
              iconSrc={locationIconImage}
              inputId="origin-desktop"
              inputName="origin-desktop"
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
            <StationAutocompleteField
              Icon={TrainFront}
              hasSearched={destinationSuggestions.hasSearched}
              inputId="destination-desktop"
              inputName="destination-desktop"
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
            {DESKTOP_STATIC_SEARCH_FIELDS.map((field) => (
              <SearchFieldControl key={field.name} field={field} />
            ))}

            <button aria-label="Find route" className={styles['search-submit']} type="button">
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

          <button className={styles['primary-action']} type="button">
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
