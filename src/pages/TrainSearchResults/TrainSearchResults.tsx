import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { ArrowLeft, Bell, CircleUserRound, Search, SlidersHorizontal } from 'lucide-react';
import type { TimetableEntry, FilterKey } from './types';
import { BahnCardBanner } from './components/BahnCardBanner';
import { SearchSummaryBar } from './components/SearchSummaryBar';
import { TrainResultCard } from './components/TrainResultCard';
import { FilterTabs } from './components/FilterTabs';
import { FILTER_OPTIONS } from './constants';
import styles from './TrainSearchResults.module.css';

function formatTimetableDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return '';
  const [, year, month, day] = match;
  return `${year.slice(-2)}${month}${day}`;
}

function formatTimetableTime(value: string) {
  return value.replace(':', '');
}

export default function TrainSearchResults() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/train-search-results' });
  const [results, setResults] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const summaryOrigin = search.originName || 'Hamburg Hbf';
  const summaryDestination = search.destinationName || 'Berlin Hbf';
  const routeTitle = `${summaryOrigin} → ${summaryDestination}`;

  useEffect(() => {
    if (!search.originEva) {
      setResults([]);
      setLoading(false);
      setHasLoaded(true);
      setHasError(false);
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      date: formatTimetableDate(search.date),
      time: formatTimetableTime(search.time),
    });

    async function loadTimetable() {
      setLoading(true);
      setHasLoaded(false);
      setHasError(false);

      try {
        const response = await fetch(
          `/api/stations/${search.originEva}/timetable?${params.toString()}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error('Timetable request failed');
        }

        const payload = (await response.json()) as TimetableEntry[];
        setResults(Array.isArray(payload) ? payload : []);
        setHasLoaded(true);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setResults([]);
        setHasError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadTimetable();
    return () => {
      controller.abort();
    };
  }, [search.date, search.originEva, search.time]);

  function handleSelectRoute() {
    navigate({ to: '/route-details' });
  }

  function handleBack() {
    navigate({ to: '/' });
  }

  const resultCount = hasLoaded ? results.length : null;

  return (
    <main className={styles.page}>
      {/* ── Mobile top bar ── */}
      <header className={styles['mobile-topbar']}>
        <button
          aria-label="Zurück zur Suche"
          className={styles['icon-button']}
          type="button"
          onClick={handleBack}
        >
          <ArrowLeft aria-hidden="true" />
        </button>
        <p className={styles['route-title']} aria-label={`Route: ${routeTitle}`}>
          {routeTitle}
        </p>
        <button aria-label="Filter und Sortierung" className={styles['icon-button']} type="button">
          <SlidersHorizontal aria-hidden="true" />
        </button>
      </header>

      {/* ── Desktop top bar ── */}
      <header className={styles['desktop-topbar']}>
        <p className={styles['desktop-brand']}>BF-NAVIGATOR</p>
        <nav aria-label="Hauptnavigation" className={styles['desktop-nav']}>
          <button className={styles['nav-link']} type="button">
            <Search aria-hidden="true" />
            <span>Suche</span>
          </button>
          <button
            className={styles['nav-link']}
            data-active="true"
            type="button"
            aria-current="page"
          >
            <span>Verbindungen</span>
          </button>
          <button className={styles['nav-link']} type="button">
            <span>Meine Reisen</span>
          </button>
          <button className={styles['nav-link']} type="button">
            <span>Profil</span>
          </button>
        </nav>
        <div className={styles['desktop-topbar-actions']}>
          <button aria-label="Benachrichtigungen" className={styles['icon-button']} type="button">
            <Bell aria-hidden="true" />
          </button>
          <button aria-label="Profil öffnen" className={styles['icon-button']} type="button">
            <CircleUserRound aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className={styles.content}>
        {/* ── Search summary ── */}
        <SearchSummaryBar
          date={search.date}
          time={search.time}
          passengerCount={2}
          resultCount={resultCount}
          onChangeSearch={handleBack}
        />

        {/* ── Filter tabs ── */}
        <FilterTabs
          options={FILTER_OPTIONS}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* ── Results list ── */}
        <section aria-labelledby="results-heading" className={styles['results-section']}>
          <h1 className={styles['sr-only']} id="results-heading">
            Suchergebnisse: Zugverbindungen von {summaryOrigin} nach {summaryDestination}
          </h1>

          {loading ? (
            <p aria-live="polite" className={styles['empty-state']} role="status">
              Verbindungen werden geladen…
            </p>
          ) : hasError ? (
            <p className={styles['empty-state']} role="alert">
              Verbindungen konnten nicht geladen werden. Bitte erneut versuchen.
            </p>
          ) : hasLoaded && results.length === 0 ? (
            <p aria-live="polite" className={styles['empty-state']} role="status">
              Keine Züge für diese Strecke und Zeit gefunden.
            </p>
          ) : (
            <ul className={styles['results-list']} role="list">
              {results.map((result, index) => (
                <li key={`${result.trainType}-${result.trainNumber}-${result.departureTime}`}>
                  <TrainResultCard
                    result={result}
                    onSelect={handleSelectRoute}
                    isRecommended={index === 0}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── BahnCard promotional banner ── */}
        <BahnCardBanner onUpgrade={() => {}} />
      </div>

      {/* ── Mobile bottom navigation ── */}
      <nav aria-label="Untere Navigation" className={styles['mobile-bottom-nav']}>
        <button className={styles['bottom-nav-item']} type="button">
          <Search aria-hidden="true" className={styles['bottom-nav-icon']} />
          <span>Suche</span>
        </button>
        <button
          aria-current="page"
          className={styles['bottom-nav-item']}
          data-active="true"
          type="button"
        >
          <ArrowLeft aria-hidden="true" className={styles['bottom-nav-icon']} />
          <span>Ergebnisse</span>
        </button>
        <button className={styles['bottom-nav-item']} type="button">
          <CircleUserRound aria-hidden="true" className={styles['bottom-nav-icon']} />
          <span>Profil</span>
        </button>
      </nav>
    </main>
  );
}
