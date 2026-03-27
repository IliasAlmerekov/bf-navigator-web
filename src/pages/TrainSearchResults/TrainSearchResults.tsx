import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Bell, CircleUserRound, Search } from 'lucide-react';
import type { FilterKey } from './types';
import { FILTER_OPTIONS, MOCK_RESULTS } from './constants';
import { BahnCardBanner } from './components/BahnCardBanner';
import { FilterTabs } from './components/FilterTabs';
import { SearchSummaryBar } from './components/SearchSummaryBar';
import { TrainResultCard } from './components/TrainResultCard';
import styles from './TrainSearchResults.module.css';

export default function TrainSearchResults() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const visibleResults = MOCK_RESULTS.filter((r) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'fastest') return r.duration <= '1 Std. 47 Min.';
    if (activeFilter === 'fewest-transfers') return r.transfers === 0;
    if (activeFilter === 'accessible') return r.isAccessible;
    if (activeFilter === 'step-free')
      return r.isAccessible && r.accessibilityNote?.includes('barrierefrei');
    if (activeFilter === 'ice-only') return r.trainType.startsWith('ICE');
    return true;
  });

  function handleSelectRoute() {
    navigate({ to: '/route-details' });
  }

  function handleBack() {
    navigate({ to: '/' });
  }

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
        <p className={styles.brand}>BF-NAVIGATOR</p>
        <div className={styles['topbar-actions']}>
          <button aria-label="Benachrichtigungen" className={styles['icon-button']} type="button">
            <Bell aria-hidden="true" />
          </button>
          <button aria-label="Profil öffnen" className={styles['icon-button']} type="button">
            <CircleUserRound aria-hidden="true" />
          </button>
        </div>
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
          date="Do, 26. Mär."
          destination="Berlin Hbf"
          origin="Hamburg Hbf"
          passengerCount={2}
          onFilterOpen={() => {}}
        />

        {/* ── Filter tabs ── */}
        <FilterTabs
          activeFilter={activeFilter}
          options={FILTER_OPTIONS}
          onFilterChange={setActiveFilter}
        />

        {/* ── Results list ── */}
        <section aria-labelledby="results-heading" className={styles['results-section']}>
          <h1 className={styles['sr-only']} id="results-heading">
            Suchergebnisse: Zugverbindungen von Hamburg Hbf nach Berlin Hbf
          </h1>

          {visibleResults.length === 0 ? (
            <p className={styles['empty-state']} role="status">
              Keine Verbindungen für diesen Filter gefunden.
            </p>
          ) : (
            <ul className={styles['results-list']} role="list">
              {visibleResults.map((result) => (
                <li key={result.id}>
                  <TrainResultCard result={result} onSelect={handleSelectRoute} />
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
