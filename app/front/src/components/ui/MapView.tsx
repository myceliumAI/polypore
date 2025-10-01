import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "../../lib/utils";

// Fix for default marker icons in React-Leaflet v4
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type MapLocation = {
  /**
   * Unique identifier
   */
  id: string | number;
  /**
   * Display name
   */
  name: string;
  /**
   * Location address
   */
  address: string;
  /**
   * Latitude
   */
  lat: number;
  /**
   * Longitude
   */
  lng: number;
  /**
   * Optional additional info to display
   */
  info?: string;
  /**
   * Optional click handler
   */
  onClick?: () => void;
};

type MapViewProps = {
  /**
   * Locations to display on the map
   */
  locations: MapLocation[];
  /**
   * Height of the map
   */
  height?: string;
  /**
   * Optional className
   */
  className?: string;
  /**
   * Center coordinates (defaults to first location or Paris)
   */
  center?: [number, number];
  /**
   * Zoom level (default: 6)
   */
  zoom?: number;
};

/**
 * MapView component that displays locations on an interactive map using Leaflet.
 *
 * :param MapLocation[] locations: Locations to display with coordinates
 * :param str height: Map height (default: "500px")
 * :param str className: Additional CSS classes
 * :param tuple center: Center coordinates [lat, lng]
 * :param int zoom: Zoom level
 */
export function MapView({
  locations,
  height = "500px",
  className = "",
  center,
  zoom = 6,
}: MapViewProps) {
  const [mounted, setMounted] = useState(false);

  // Ensure Leaflet is only loaded on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate center from locations if not provided
  const mapCenter: [number, number] = center
    ? center
    : locations.length > 0
      ? [locations[0].lat, locations[0].lng]
      : [48.8566, 2.3522]; // Paris default

  if (!mounted) {
    return (
      <div
        style={{ height }}
        className={cn(
          "bg-neutral-100 dark:bg-neutral-900 rounded-xl flex items-center justify-center",
          className,
        )}
      >
        <p className="text-neutral-500 dark:text-neutral-400">Loading map...</p>
      </div>
    );
  }

  return (
    <div
      style={{ height }}
      className={cn(
        "rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm",
        className,
      )}
    >
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            icon={icon}
            eventHandlers={{
              click: () => {
                if (location.onClick) {
                  location.onClick();
                }
              },
            }}
          >
            <Popup>
              <div className="text-sm">
                <h3 className="font-semibold text-neutral-900 mb-1">
                  {location.name}
                </h3>
                <p className="text-neutral-600 text-xs mb-1">
                  {location.address}
                </p>
                {location.info && (
                  <p className="text-neutral-500 text-xs">{location.info}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
