"use client";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { IconBuildingSkyscraper } from "@tabler/icons-react";
import { communities } from "../data/dummyData";

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '16px',
  overflow: 'hidden',
};

const center = {
  lat: 25.2048, // Dubai
  lng: 55.2708,
};

// Light Dream style from Snazzy Maps
const lightDreamMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] },
  { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "road.arterial", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#dadada" }] },
  { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
  { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9c9c9" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }
];

// Material Design 'Location City' icon as SVG data URL
const buildingSvg = encodeURIComponent(`
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g>
      <rect x="12" y="24" width="40" height="28" rx="4" fill="#E5E7EB" stroke="#A3A3A3" stroke-width="2"/>
      <rect x="20" y="32" width="8" height="12" rx="1" fill="#B0B6BE"/>
      <rect x="36" y="32" width="8" height="12" rx="1" fill="#B0B6BE"/>
      <rect x="28" y="40" width="8" height="12" rx="1" fill="#D1D5DB"/>
      <rect x="24" y="16" width="16" height="16" rx="2" fill="#F3F4F6" stroke="#A3A3A3" stroke-width="2"/>
      <rect x="28" y="20" width="8" height="8" rx="1" fill="#B0B6BE"/>
      <rect x="30" y="44" width="4" height="8" rx="1" fill="#9CA3AF"/>
    </g>
  </svg>
`);
const buildingIcon = {
  url: `data:image/svg+xml,${buildingSvg}`,
  scaledSize: { width: 48, height: 48 },
  anchor: { x: 24, y: 48 },
};

/**
 * @param {{ buildings: Array<any> }} props
 */
export default function Map({ buildings = [] }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  // Check if API key is configured
  if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
    return (
      <div className="w-full h-[400px] flex flex-col items-center justify-center bg-gray-100 rounded-xl p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Google Maps API Key Required</h3>
          <p className="text-gray-600 mb-4">
            Please configure your Google Maps API key in the .env.local file
          </p>
          <div className="bg-gray-200 p-3 rounded-lg text-sm font-mono text-gray-700">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
          </div>
        </div>
      </div>
    );
  }

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  // Center on first building or default
  const center = buildings.length > 0 ? buildings[0].location : { lat: 25.2048, lng: 55.2708 };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      options={{
        // Remove styles for standard view
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
      }}
    >
      {buildings.map((b) => (
        <Marker
          key={b.id}
          position={b.location}
          icon={buildingIcon}
          title={b.name}
        />
      ))}
    </GoogleMap>
  ) : (
    <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-xl">Loading map…</div>
  );
} 