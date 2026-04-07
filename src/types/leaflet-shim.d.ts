declare module 'leaflet' {
  export type LeafletTooltipDirection = 'auto' | 'top' | 'bottom' | 'left' | 'right' | 'center';

  export type LeafletTooltipOptions = {
    direction?: LeafletTooltipDirection;
    offset?: [number, number];
  };

  export type LeafletLayer = {
    addTo(map: unknown): LeafletLayer;
    bindTooltip?(content: string, options?: LeafletTooltipOptions): LeafletLayer;
  };

  export type LeafletPathOptions = {
    color?: string;
    dashArray?: string;
    fillColor?: string;
    fillOpacity?: number;
    lineCap?: 'butt' | 'round' | 'square';
    lineJoin?: 'miter' | 'round' | 'bevel';
    opacity?: number;
    radius?: number;
    weight?: number;
  };

  export type LeafletDivIconOptions = {
    className?: string;
    html?: string;
    iconAnchor?: [number, number];
    iconSize?: [number, number];
  };

  export type LeafletMarkerOptions = {
    icon?: LeafletDivIcon;
  };

  export type LeafletDivIcon = Record<string, unknown>;

  export type LeafletCoordinate = [number, number];

  export type LeafletLatLngBounds = {
    isValid(): boolean;
  };

  const Leaflet: {
    latLngBounds(positions: LeafletCoordinate[]): LeafletLatLngBounds;
    circleMarker(position: LeafletCoordinate, options?: LeafletPathOptions): LeafletLayer;
    divIcon(options: LeafletDivIconOptions): LeafletDivIcon;
    marker(position: LeafletCoordinate, options?: LeafletMarkerOptions): LeafletLayer;
    polyline(positions: LeafletCoordinate[], options?: LeafletPathOptions): LeafletLayer;
  };

  export default Leaflet;
}

declare module 'react-leaflet' {
  import type { ComponentType, ReactNode } from 'react';

  export type LeafletMapController = {
    boxZoom: { disable(): void };
    doubleClickZoom: { disable(): void };
    dragging: { disable(): void };
    getCenter(): [number, number];
    getZoom(): number;
    keyboard: { disable(): void };
    removeLayer(layer: unknown): void;
    scrollWheelZoom: { disable(): void; enable(): void };
    fitBounds(
      bounds: import('leaflet').LeafletLatLngBounds,
      options?: {
        animate?: boolean;
        maxZoom?: number;
        padding?: [number, number];
      }
    ): void;
    setView(center: [number, number], zoom: number, options?: { animate?: boolean }): void;
    tap?: { disable(): void };
    touchZoom: { disable(): void };
  };

  export type MapContainerProps = {
    'aria-hidden'?: boolean | 'false' | 'true';
    center: [number, number];
    children?: ReactNode;
    className?: string;
    scrollWheelZoom?: boolean;
    zoom: number;
    zoomControl?: boolean;
  };

  export type TileLayerProps = {
    attribution?: string;
    url: string;
  };

  export const MapContainer: ComponentType<MapContainerProps>;
  export const TileLayer: ComponentType<TileLayerProps>;
  export function useMap(): LeafletMapController;
}
