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
    fillColor?: string;
    fillOpacity?: number;
    lineCap?: 'butt' | 'round' | 'square';
    lineJoin?: 'miter' | 'round' | 'bevel';
    opacity?: number;
    radius?: number;
    weight?: number;
  };

  export type LeafletCoordinate = [number, number];

  const Leaflet: {
    circleMarker(position: LeafletCoordinate, options?: LeafletPathOptions): LeafletLayer;
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
    keyboard: { disable(): void };
    removeLayer(layer: unknown): void;
    scrollWheelZoom: { disable(): void };
    setView(center: [number, number], zoom: number, options?: { animate?: boolean }): void;
    tap?: { disable(): void };
    touchZoom: { disable(): void };
  };

  export type MapContainerProps = {
    'aria-hidden'?: boolean | 'false' | 'true';
    center: [number, number];
    children?: ReactNode;
    className?: string;
    zoom: number;
    zoomControl?: boolean;
  };

  export type TileLayerProps = {
    url: string;
  };

  export const MapContainer: ComponentType<MapContainerProps>;
  export const TileLayer: ComponentType<TileLayerProps>;
  export function useMap(): LeafletMapController;
}
