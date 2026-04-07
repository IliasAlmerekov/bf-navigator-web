import { useEffect, useState } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { ROUTE_OVERVIEW_TRIP_ID, buildRouteOverviewSavedTrip } from '../../constants/savedTrips';
import { hasSavedTrip, removeSavedTrip, upsertSavedTrip } from '../../utils/savedTripsStorage';
import { getSelectedTrainRoute } from '../../utils/selectedTrainRouteStorage';
import { ROUTE_HERO, ROUTE_STATION_SERVICES_PANEL, ROUTE_TIMELINE } from './constants';
import { buildRouteOverviewMapData } from './mapData';
import { JourneyTimeline } from './components/JourneyTimeline';
import { MapNavigationCard } from './components/MapNavigationCard';
import { RouteHero } from './components/RouteHero';
import { StationServicesPanel } from './components/StationServicesPanel';
import {
  buildSavedTripFromRoute,
  getRouteOverviewFacilities,
  getRouteOverviewMapLabels,
  getRouteOverviewMapPath,
  getRouteOverviewMapStopMarkers,
  mapTrainRouteToRouteHero,
  mapTrainRouteToStationServicesPanel,
  mapTrainRouteToTimeline,
} from './routeOverviewData';
import styles from './RouteOverview.module.css';

export default function RouteOverview() {
  const search = useSearch({ from: '/route-overview' });
  const selectedRoute = getSelectedTrainRoute();
  const savedTrip = selectedRoute ? buildSavedTripFromRoute(selectedRoute) : null;
  const savedTripId = savedTrip?.id ?? ROUTE_OVERVIEW_TRIP_ID;
  const heroRoute = selectedRoute ? mapTrainRouteToRouteHero(selectedRoute) : ROUTE_HERO;
  const timelineItems =
    selectedRoute && selectedRoute.touchpoints?.length
      ? mapTrainRouteToTimeline(selectedRoute)
      : ROUTE_TIMELINE;
  const stationServicesPanel =
    selectedRoute && selectedRoute.touchpoints?.length
      ? (mapTrainRouteToStationServicesPanel(selectedRoute) ?? ROUTE_STATION_SERVICES_PANEL)
      : ROUTE_STATION_SERVICES_PANEL;
  const routeMapData = selectedRoute
    ? buildRouteOverviewMapData({
        facilities: getRouteOverviewFacilities(selectedRoute),
        labels: getRouteOverviewMapLabels(selectedRoute),
        routePath: getRouteOverviewMapPath(selectedRoute),
        stopMarkers: getRouteOverviewMapStopMarkers(selectedRoute),
      })
    : buildRouteOverviewMapData();
  const [isRouteSaved, setIsRouteSaved] = useState(() => hasSavedTrip(savedTripId));
  const [savedAnnouncement, setSavedAnnouncement] = useState('');

  useEffect(() => {
    setIsRouteSaved(hasSavedTrip(savedTripId));
  }, [savedTripId]);

  function handleSave() {
    setIsRouteSaved((current) => {
      const next = !current;

      if (next) {
        upsertSavedTrip(savedTrip ?? buildRouteOverviewSavedTrip());
      } else {
        removeSavedTrip(savedTripId);
      }

      setSavedAnnouncement(
        next
          ? 'Route wurde zu deinen gespeicherten Reisen hinzugefügt.'
          : 'Route wurde aus deinen gespeicherten Reisen entfernt.'
      );
      return next;
    });
  }

  return (
    <main className={styles.page}>
      <RouteHero
        isSaved={isRouteSaved}
        route={heroRoute}
        resultsSearch={search}
        onSave={handleSave}
      />

      <p aria-live="polite" className={styles['status-announcement']}>
        {savedAnnouncement}
      </p>

      <div className={styles.layout}>
        <div className={styles['timeline-column']}>
          <section
            aria-labelledby="detailed-timeline-heading"
            className={styles['timeline-section']}
          >
            <header className={styles['timeline-header']}>
              <h2 id="detailed-timeline-heading" className={styles['card-title']}>
                Detaillierter Reiseverlauf
              </h2>
              <div className={styles['header-badges']}>
                <span className={styles['badge-on-time']}>Pünktlich</span>
                <span className={styles['badge-train']}>ICE772</span>
              </div>
            </header>

            <JourneyTimeline items={timelineItems} />

            <div className={styles['action-row']}>
              <Link className={styles['action-button']} to="/train-search-results" search={search}>
                <span>Alternativen anzeigen</span>
              </Link>
            </div>
          </section>

          <StationServicesPanel panel={stationServicesPanel} />
        </div>

        <div className={styles['detail-column']}>
          <MapNavigationCard mapData={routeMapData} />
        </div>
      </div>
    </main>
  );
}
