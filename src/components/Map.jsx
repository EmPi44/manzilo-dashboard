"use client";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { IconBuildingSkyscraper } from "@tabler/icons-react";

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

// Comic/cartoon style map (Snazzy Maps or similar)
const comicMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#ebe3cd' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#523735' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f1e6' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#c9b2a6' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#dfd2ae' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#a5b076' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#f5f1e6' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#fdfcf8' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#f8c967' }] },
  { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#b9d3c2' }] },
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

export default function Map() {
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

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      options={{
        styles: comicMapStyle,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
      }}
    >
      <Marker
        position={center}
        icon={buildingIcon}
        title="Property Manager Building"
      />
    </GoogleMap>
  ) : (
    <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-xl">Loading map…</div>
  );
} 