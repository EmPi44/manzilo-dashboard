"use client";
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '16px',
  overflow: 'hidden',
};

const center = {
  lat: 52.52, // Example: Berlin
  lng: 13.405,
};

export default function Map() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, // Store your key in .env.local
  });

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
      }}
    />
  ) : (
    <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-xl">Loading map…</div>
  );
} 