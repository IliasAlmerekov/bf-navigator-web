import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import type { RouteMapData } from '../types';
import styles from '../RouteOverview.module.css';
import 'leaflet/dist/leaflet.css';

type RouteMapCanvasProps = {
  mapData: RouteMapData;
  zoom: number;
};

type MarkerPresentation = {
  color: string;
  fillColor: string;
  radius: number;
  weight: number;
};

const markerPresentationByKind: Record<
  RouteMapData['markers'][number]['kind'],
  MarkerPresentation
> = {
  destination: {
    color: '#f8fafc',
    fillColor: '#1d4ed8',
    radius: 8,
    weight: 3,
  },
  facility: {
    color: '#082f49',
    fillColor: '#f8fafc',
    radius: 6,
    weight: 2,
  },
  origin: {
    color: '#082f49',
    fillColor: '#6ee7f9',
    radius: 8,
    weight: 3,
  },
  transfer: {
    color: '#d97706',
    fillColor: '#fff7ed',
    radius: 7,
    weight: 3,
  },
};

function MapViewportController({ center, zoom }: Pick<RouteMapData, 'center'> & { zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: false });
  }, [center, map, zoom]);

  return null;
}

function RouteMapLayers({ mapData }: Pick<RouteMapCanvasProps, 'mapData'>) {
  const map = useMap();

  useEffect(() => {
    const createdLayers: unknown[] = [];

    const polyline = L.polyline(mapData.routePath, {
      color: '#6ee7f9',
      lineCap: 'round',
      lineJoin: 'round',
      opacity: 0.95,
      weight: 5,
    }).addTo(map);

    createdLayers.push(polyline);

    mapData.markers.forEach((marker) => {
      const presentation = markerPresentationByKind[marker.kind];

      const circleMarker = L.circleMarker(marker.position, {
        color: presentation.color,
        fillColor: presentation.fillColor,
        fillOpacity: 1,
        opacity: 1,
        radius: presentation.radius,
        weight: presentation.weight,
      }).addTo(map);

      if (marker.description) {
        circleMarker.bindTooltip?.(`${marker.label}: ${marker.description}`, {
          direction: 'top',
          offset: [0, -8],
        });
      }

      createdLayers.push(circleMarker);
    });

    return () => {
      createdLayers.forEach((layer) => {
        map.removeLayer(layer);
      });
    };
  }, [map, mapData]);

  return null;
}

export function RouteMapCanvas({ mapData, zoom }: RouteMapCanvasProps) {
  return (
    <MapContainer
      aria-hidden="true"
      center={mapData.center}
      className={`${styles['leaflet-map']} route-overview-leaflet-map`}
      zoom={zoom}
      zoomControl={false}
    >
      <MapViewportController center={mapData.center} zoom={zoom} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <RouteMapLayers mapData={mapData} />
    </MapContainer>
  );
}
