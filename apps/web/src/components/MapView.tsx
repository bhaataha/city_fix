'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl/mapbox';
import { MapPin } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

// Free community Mapbox style — no token required for development
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
const MAP_STYLE = MAPBOX_TOKEN
  ? 'mapbox://styles/mapbox/dark-v11'
  : 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

// Default center: Tel-Aviv
const DEFAULT_CENTER = { latitude: 32.0853, longitude: 34.7818 };

export interface MapIssue {
  id: string;
  lat: number;
  lng: number;
  category: string;
  status: string;
  color: string;
  urgency?: string;
  address?: string;
  reportNumber?: string;
}

interface MapViewProps {
  issues?: MapIssue[];
  center?: { latitude: number; longitude: number };
  zoom?: number;
  onIssueClick?: (issue: MapIssue) => void;
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
  /** Show a single pin at this location (for location picker mode) */
  pickerPin?: { lat: number; lng: number } | null;
  showControls?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function MapView({
  issues = [],
  center = DEFAULT_CENTER,
  zoom = 14,
  onIssueClick,
  onMapClick,
  pickerPin,
  showControls = true,
  className = '',
  style,
}: MapViewProps) {
  const mapRef = useRef<any>(null);
  const [selected, setSelected] = useState<MapIssue | null>(null);
  const [viewState, setViewState] = useState({
    latitude: center.latitude,
    longitude: center.longitude,
    zoom,
  });

  // Update center when prop changes
  useEffect(() => {
    setViewState((v) => ({
      ...v,
      latitude: center.latitude,
      longitude: center.longitude,
    }));
  }, [center.latitude, center.longitude]);

  const handleClick = useCallback(
    (e: any) => {
      if (onMapClick) {
        onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
      }
    },
    [onMapClick],
  );

  return (
    <div className={`relative w-full h-full ${className}`} style={style}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onClick={handleClick}
        mapboxAccessToken={MAPBOX_TOKEN || undefined}
        mapStyle={MAP_STYLE}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        reuseMaps
      >
        {showControls && (
          <>
            <NavigationControl position="top-left" showCompass={false} />
            <GeolocateControl
              position="top-left"
              trackUserLocation
              showUserHeading
            />
          </>
        )}

        {/* Issue markers */}
        {issues.map((issue) => (
          <Marker
            key={issue.id}
            latitude={issue.lat}
            longitude={issue.lng}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelected(issue);
              onIssueClick?.(issue);
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-125"
              style={{
                background: issue.color,
                boxShadow: `0 0 12px ${issue.color}60`,
                border: '2px solid rgba(255,255,255,0.3)',
              }}
            >
              <MapPin size={14} color="white" />
            </div>
          </Marker>
        ))}

        {/* Popup on select */}
        {selected && (
          <Popup
            latitude={selected.lat}
            longitude={selected.lng}
            anchor="bottom"
            offset={20}
            closeOnClick={false}
            onClose={() => setSelected(null)}
            className="cityfix-popup"
          >
            <div
              className="rounded-lg p-3 min-w-[180px]"
              style={{
                background: 'var(--color-surface-1, #1a1f2e)',
                border: '1px solid var(--color-border, #2d3548)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: selected.color }}
                />
                <span
                  className="text-sm font-bold"
                  style={{ color: 'var(--color-text-primary, #fff)' }}
                >
                  {selected.category}
                </span>
              </div>
              {selected.address && (
                <p
                  className="text-xs mb-1"
                  style={{ color: 'var(--color-text-muted, #9ca3af)' }}
                >
                  {selected.address}
                </p>
              )}
              <span
                className="text-xs font-semibold"
                style={{ color: selected.color }}
              >
                {selected.status}
              </span>
            </div>
          </Popup>
        )}

        {/* Picker pin (for report wizard location step) */}
        {pickerPin && (
          <Marker
            latitude={pickerPin.lat}
            longitude={pickerPin.lng}
            anchor="bottom"
          >
            <div className="relative">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center animate-bounce"
                style={{
                  background: 'linear-gradient(135deg, #818CF8, #6366F1)',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
                  border: '3px solid white',
                }}
              >
                <MapPin size={18} color="white" />
              </div>
              {/* Shadow dot */}
              <div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 rounded-full opacity-30"
                style={{ background: '#000' }}
              />
            </div>
          </Marker>
        )}
      </Map>

      {/* Custom popup styles */}
      <style jsx global>{`
        .mapboxgl-popup-content,
        .cityfix-popup .mapboxgl-popup-content {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 12px !important;
        }
        .mapboxgl-popup-tip {
          display: none !important;
        }
        .mapboxgl-popup-close-button {
          color: #9ca3af !important;
          font-size: 16px !important;
          right: 4px !important;
          top: 4px !important;
        }
        .mapboxgl-ctrl-group {
          background: rgba(17, 24, 39, 0.9) !important;
          border: 1px solid rgba(45, 53, 72, 0.6) !important;
          border-radius: 12px !important;
          overflow: hidden;
        }
        .mapboxgl-ctrl-group button {
          border-color: rgba(45, 53, 72, 0.4) !important;
        }
        .mapboxgl-ctrl-group button + button {
          border-top: 1px solid rgba(45, 53, 72, 0.4) !important;
        }
        .mapboxgl-ctrl-icon {
          filter: invert(1) !important;
        }
      `}</style>
    </div>
  );
}
