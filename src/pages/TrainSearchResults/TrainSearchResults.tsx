import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import type { FilterKey, TrainRouteResponse } from './types';
import { MOCK_ROUTES } from './mockData';
import { SearchSummaryBar } from './components/SearchSummaryBar';
import { TrainResultCard } from './components/TrainResultCard';
import { FilterTabs } from './components/FilterTabs';
import { Pagination } from './components/Pagination';
import { FILTER_OPTIONS } from './constants';
import styles from './TrainSearchResults.module.css';

const RESULTS_PER_PAGE = 5;

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
  const [results, setResults] = useState<TrainRouteResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const summaryOrigin = search.originName || 'Hamburg Hbf';
  const summaryDestination = search.destinationName || 'Berlin Hbf';

  useEffect(() => {
    if (!search.originEva) {
      // TODO: Remove mock data before production
      setResults(MOCK_ROUTES);
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

    async function loadRoutes() {
      setLoading(true);
      setHasLoaded(false);
      setHasError(false);
      setCurrentPage(1);

      try {
        // TODO: Replace with Google Routes API endpoint
        // Expected response shape: { routes: TrainRouteResponse[] }
        const response = await fetch(
          `/api/stations/${search.originEva}/timetable?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) throw new Error('Route request failed');

        const payload = await response.json();
        // Supports both legacy array and new { routes: [] } format
        const routes: TrainRouteResponse[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.routes)
            ? payload.routes
            : [];
        setResults(routes);
        setHasLoaded(true);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setResults([]);
        setHasError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadRoutes();
    return () => controller.abort();
  }, [search.date, search.originEva, search.time]);

  function handleSelectRoute() {
    navigate({ to: '/route-overview' });
  }

  function handleBack() {
    navigate({ to: '/' });
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const totalPages = Math.ceil(results.length / RESULTS_PER_PAGE);
  const pagedResults = results.slice(
    (currentPage - 1) * RESULTS_PER_PAGE,
    currentPage * RESULTS_PER_PAGE
  );
  const resultCount = hasLoaded ? results.length : null;

  return (
    <div className={styles.page}>
      <SearchSummaryBar
        date={search.date}
        time={search.time}
        originName={summaryOrigin}
        destinationName={summaryDestination}
        resultCount={resultCount}
        onChangeSearch={handleBack}
      />

      {!hasError && (
        <FilterTabs
          options={FILTER_OPTIONS}
          activeFilter={activeFilter}
          onFilterChange={(key) => {
            setActiveFilter(key);
            setCurrentPage(1);
          }}
        />
      )}

      <section aria-labelledby="results-heading" className={styles['results-section']}>
        <h2 className={styles['sr-only']} id="results-heading">
          Suchergebnisse: Zugverbindungen von {summaryOrigin} nach {summaryDestination}
        </h2>

        {loading ? (
          <p aria-live="polite" className={styles['empty-state']} role="status">
            Verbindungen werden geladen…
          </p>
        ) : hasError ? (
          <p className={styles['empty-state']} role="alert">
            Verbindungen konnten nicht geladen werden. Bitte versuchen Sie es erneut.
          </p>
        ) : hasLoaded && results.length === 0 ? (
          <p aria-live="polite" className={styles['empty-state']} role="status">
            Keine Verbindungen für diese Strecke gefunden.
          </p>
        ) : (
          <>
            <ul className={styles['results-list']} role="list">
              {pagedResults.map((route, index) => (
                <li key={`route-${(currentPage - 1) * RESULTS_PER_PAGE + index}`}>
                  <TrainResultCard
                    route={route}
                    onSelect={handleSelectRoute}
                    isRecommended={currentPage === 1 && index === 0}
                  />
                </li>
              ))}
            </ul>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </section>
    </div>
  );
}
