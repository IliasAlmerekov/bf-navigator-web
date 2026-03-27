import type { FilterKey, FilterOption } from '../types';
import styles from './FilterTabs.module.css';

interface FilterTabsProps {
  options: FilterOption[];
  activeFilter: FilterKey;
  onFilterChange: (key: FilterKey) => void;
}

export function FilterTabs({ options, activeFilter, onFilterChange }: FilterTabsProps) {
  return (
    <nav aria-label="Verbindungsfilter" className={styles.nav}>
      <ul className={styles.list} role="list">
        {options.map((option) => (
          <li key={option.key}>
            <button
              aria-pressed={activeFilter === option.key}
              className={styles.chip}
              data-active={activeFilter === option.key}
              type="button"
              onClick={() => onFilterChange(option.key)}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
