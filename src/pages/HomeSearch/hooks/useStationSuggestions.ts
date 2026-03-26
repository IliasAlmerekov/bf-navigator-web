import { useEffect, useState } from 'react';
import {
  MAX_STATION_SUGGESTIONS,
  MIN_STATION_QUERY_LENGTH,
  STATION_SEARCH_DEBOUNCE_MS,
} from '../constants';
import type { StationSuggestion } from '../types';

type UseStationSuggestionsResult = {
  error: string | null;
  hasSearched: boolean;
  loading: boolean;
  suggestions: StationSuggestion[];
};

export function useStationSuggestions(
  query: string,
  enabled: boolean
): UseStationSuggestionsResult {
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [suggestions, setSuggestions] = useState<StationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!enabled || trimmedQuery.length < MIN_STATION_QUERY_LENGTH) {
      setDebouncedQuery('');
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(trimmedQuery);
    }, STATION_SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [enabled, query]);

  useEffect(() => {
    if (!enabled || debouncedQuery === '') {
      setSuggestions([]);
      setLoading(false);
      setError(null);
      setHasSearched(false);
      return;
    }

    const abortController = new AbortController();

    async function fetchSuggestions() {
      setLoading(true);
      setError(null);
      setHasSearched(false);

      try {
        const params = new URLSearchParams({
          query: `${debouncedQuery}*`,
        });

        const response = await fetch(`/api/stations/search?${params.toString()}`, {
          headers: {
            Accept: 'application/json',
          },
          signal: abortController.signal,
        });

        if (!response.ok) {
          setSuggestions([]);
          setError('Station suggestions are temporarily unavailable.');
          setHasSearched(true);
          return;
        }

        const data = (await response.json()) as StationSuggestion[];

        setSuggestions(data.slice(0, MAX_STATION_SUGGESTIONS));
        setHasSearched(true);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setSuggestions([]);
        setError('Station suggestions are temporarily unavailable.');
        setHasSearched(true);
      } finally {
        setLoading(false);
      }
    }

    void fetchSuggestions();

    return () => {
      abortController.abort();
    };
  }, [debouncedQuery, enabled]);

  return {
    error,
    hasSearched,
    loading,
    suggestions,
  };
}
