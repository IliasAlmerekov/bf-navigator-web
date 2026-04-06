import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import type { TrainRouteResponse } from './types';
import { searchTrainRoute } from '../../services/trainRoutesApi';
import { SearchSummaryBar } from './components/SearchSummaryBar';
import { TrainResultCard } from './components/TrainResultCard';
import { Pagination } from './components/Pagination';
import { buildTrainRouteSearchRequest } from './request';
import { saveSelectedTrainRoute } from '../../utils/selectedTrainRouteStorage';
import styles from './TrainSearchResults.module.css';

const RESULTS_PER_PAGE = 5;

function shouldReduceMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function TrainSearchResults() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/train-search-results' });
  const [results, setResults] = useState<TrainRouteResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const hasRouteSummary = search.originName !== '' && search.destinationName !== '';
  const resultsHeading = hasRouteSummary
    ? `Suchergebnisse: Zugverbindungen von ${search.originName} nach ${search.destinationName}`
    : 'Suchergebnisse: Zugverbindungen';

  useEffect(() => {
    const controller = new AbortController();

    async function loadRoutes() {
      setLoading(true);
      setHasLoaded(false);
      setHasError(false);
      setCurrentPage(1);

      try {
        const request = buildTrainRouteSearchRequest({
          date: search.date,
          destinationName: search.destinationName,
          originName: search.originName,
          time: search.time,
        });
        const response = await searchTrainRoute(request, controller.signal);
        setResults(response.trips);
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
  }, [search.date, search.destinationName, search.originName, search.time]);

  function handleSelectRoute(route: TrainRouteResponse) {
    saveSelectedTrainRoute(route);
    navigate({
      to: '/route-overview',
      search: {
        accessibilityPreference: search.accessibilityPreference,
        date: search.date,
        destinationEva: search.destinationEva,
        destinationName: search.destinationName,
        originEva: search.originEva,
        originName: search.originName,
        time: search.time,
      },
    });
  }

  function handleBack() {
    navigate({ to: '/' });
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: shouldReduceMotion() ? 'auto' : 'smooth' });
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
        originName={search.originName}
        destinationName={search.destinationName}
        resultCount={resultCount}
        onChangeSearch={handleBack}
      />

      <section aria-labelledby="results-heading" className={styles['results-section']}>
        <h2 className={styles['sr-only']} id="results-heading">
          {resultsHeading}
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
                    onSelect={() => handleSelectRoute(route)}
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
