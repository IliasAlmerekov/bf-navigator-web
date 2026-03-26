import { useState } from 'react';
import type { FocusEvent, KeyboardEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import { MIN_STATION_QUERY_LENGTH } from '../constants';
import type { StationSuggestion } from '../types';
import styles from './StationAutocompleteField.module.css';

type StationAutocompleteFieldProps =
  | {
      error: string | null;
      hasSearched: boolean;
      iconAlt: string;
      iconSrc: string;
      inputId: string;
      inputName: string;
      isActive: boolean;
      label: string;
      loading: boolean;
      onActiveChange: (nextActive: boolean) => void;
      onInputChange: (value: string) => void;
      onStationSelect: (station: StationSuggestion) => void;
      suggestions: StationSuggestion[];
      value: string;
      variant: 'desktop' | 'mobile';
    }
  | {
      Icon: LucideIcon;
      error: string | null;
      hasSearched: boolean;
      inputId: string;
      inputName: string;
      isActive: boolean;
      label: string;
      loading: boolean;
      onActiveChange: (nextActive: boolean) => void;
      onInputChange: (value: string) => void;
      onStationSelect: (station: StationSuggestion) => void;
      suggestions: StationSuggestion[];
      value: string;
      variant: 'desktop' | 'mobile';
    };

export function StationAutocompleteField(props: StationAutocompleteFieldProps) {
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const listboxId = `${props.inputId}-listbox`;
  const statusId = `${props.inputId}-status`;
  const trimmedValue = props.value.trim();
  const showEmptyState =
    props.isActive &&
    trimmedValue.length >= MIN_STATION_QUERY_LENGTH &&
    props.hasSearched &&
    !props.loading &&
    !props.error &&
    props.suggestions.length === 0;
  const showDropdown =
    props.isActive &&
    trimmedValue.length >= MIN_STATION_QUERY_LENGTH &&
    (props.loading || Boolean(props.error) || props.suggestions.length > 0 || showEmptyState);
  const statusMessage = props.loading
    ? 'Searching stations.'
    : props.error
      ? props.error
      : showEmptyState
        ? 'No stations found for this city.'
        : '';
  const activeOptionIndex =
    highlightedIndex >= 0 && highlightedIndex < props.suggestions.length
      ? highlightedIndex
      : props.suggestions.length > 0
        ? 0
        : -1;

  function handleSelect(station: StationSuggestion) {
    props.onStationSelect(station);
    props.onActiveChange(false);
    setHighlightedIndex(-1);
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }

    props.onActiveChange(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown) {
      if (event.key === 'Escape' && props.isActive) {
        event.preventDefault();
        props.onActiveChange(false);
      }

      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();

      if (props.suggestions.length === 0) {
        return;
      }

      setHighlightedIndex((currentIndex) => {
        if (currentIndex >= props.suggestions.length - 1) {
          return 0;
        }

        return currentIndex + 1;
      });
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();

      if (props.suggestions.length === 0) {
        return;
      }

      setHighlightedIndex((currentIndex) => {
        if (currentIndex <= 0) {
          return props.suggestions.length - 1;
        }

        return currentIndex - 1;
      });
    }

    if (event.key === 'Enter') {
      const highlightedStation = props.suggestions[activeOptionIndex];

      if (!highlightedStation) {
        return;
      }

      event.preventDefault();
      handleSelect(highlightedStation);
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      props.onActiveChange(false);
      setHighlightedIndex(-1);
    }
  }

  return (
    <div
      className={`${styles.field} ${styles[props.variant]}`}
      data-open={showDropdown}
      onBlur={handleBlur}
    >
      <label className={styles.control} htmlFor={props.inputId}>
        {'iconSrc' in props ? (
          <img alt={props.iconAlt} className={styles['image-icon']} src={props.iconSrc} />
        ) : (
          <props.Icon aria-hidden="true" className={styles.icon} />
        )}
        <span className={styles.label}>{props.label}</span>
        <input
          aria-activedescendant={
            showDropdown && activeOptionIndex >= 0
              ? `${props.inputId}-option-${activeOptionIndex}`
              : undefined
          }
          aria-autocomplete="list"
          aria-controls={showDropdown ? listboxId : undefined}
          aria-describedby={statusMessage ? statusId : undefined}
          aria-expanded={showDropdown}
          aria-label={props.label}
          autoComplete="off"
          className={styles.input}
          id={props.inputId}
          name={props.inputName}
          onChange={(event) => {
            props.onInputChange(event.target.value);
          }}
          onFocus={() => {
            props.onActiveChange(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Start typing a city"
          role="combobox"
          type="text"
          value={props.value}
        />
      </label>

      {statusMessage ? (
        <p aria-live="polite" className={styles['sr-only']} id={statusId}>
          {statusMessage}
        </p>
      ) : null}

      {showDropdown ? (
        <div className={styles.dropdown} id={listboxId} role="listbox">
          {props.loading ? <p className={styles.status}>Searching stations...</p> : null}

          {props.error ? (
            <p className={`${styles.status} ${styles['status-error']}`}>{props.error}</p>
          ) : null}

          {showEmptyState ? <p className={styles.status}>No stations found.</p> : null}

          {!props.loading && !props.error
            ? props.suggestions.map((station, index) => (
                <button
                  aria-selected={index === activeOptionIndex}
                  className={styles.option}
                  data-highlighted={index === activeOptionIndex}
                  id={`${props.inputId}-option-${index}`}
                  key={`${station.evaNumber}-${station.name}`}
                  onClick={() => {
                    handleSelect(station);
                  }}
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}
                  role="option"
                  tabIndex={-1}
                  type="button"
                >
                  <span className={styles['option-primary']}>{station.name}</span>
                  <span className={styles['option-secondary']}>{station.city}</span>
                </button>
              ))
            : null}
        </div>
      ) : null}
    </div>
  );
}
