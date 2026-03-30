import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  DESTINATION_WEATHER,
  ROUTE_HERO,
  ROUTE_HIGHLIGHTS,
  ROUTE_TIMELINE,
  STATION_ACCESSIBILITY,
} from './constants';
import { JourneyTimeline } from './components/JourneyTimeline';
import { RouteHero } from './components/RouteHero';
import { RouteSupportAside } from './components/RouteSupportAside';
import { StationAccessibilityPanel } from './components/StationAccessibilityPanel';
import styles from './RouteOverview.module.css';

export default function RouteOverview() {
  const navigate = useNavigate();
  const [isRouteSaved, setIsRouteSaved] = useState(false);

  function handleBack() {
    void navigate({ to: '/' });
  }

  function handleSave() {
    setIsRouteSaved((current) => !current);
  }

  return (
    <main className={styles.page}>
      <RouteHero route={ROUTE_HERO} onBack={handleBack} onSave={handleSave} />

      <p aria-live="polite" className={styles['status-announcement']}>
        {isRouteSaved
          ? 'Route saved to your trips.'
          : 'Route not saved yet. Use the save action to keep it for later.'}
      </p>

      <div className={styles.layout}>
        <JourneyTimeline items={ROUTE_TIMELINE} />

        <div className={styles['detail-column']}>
          <StationAccessibilityPanel items={STATION_ACCESSIBILITY} />
          <RouteSupportAside
            highlights={ROUTE_HIGHLIGHTS}
            onSave={handleSave}
            weather={DESTINATION_WEATHER}
          />
        </div>
      </div>
    </main>
  );
}
