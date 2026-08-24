"use client";

import { useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { Place } from '@/types';

interface MapComponentProps {
  places: Place[];
  center?: { lat: number; lng: number };
  hoveredPlaceId?: string | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  restaurant: '#ef4444',
  cafe: '#f97316',
  hotel: '#3b82f6',
  park: '#22c55e',
  shopping: '#a855f7',
  attraction: '#ec4899',
  thingstodo: '#14b8a6',
};

function MapUpdater({ center }: { center: {lat: number, lng: number} }) {
  const map = useMap();
  useEffect(() => {
    if (map && center) {
      map.panTo(center);
    }
  }, [map, center]);
  return null;
}

export default function MapComponent({ places, center, hoveredPlaceId }: MapComponentProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  
  const mapCenter = center || (places.length > 0 ? places[0].location : { lat: 22.7533, lng: 75.8937 }); // Default to Indore Vijay Nagar

  if (!apiKey) return <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 font-inter">Google Maps API Key missing in .env.local</div>;

  return (
    <APIProvider apiKey={apiKey}>
      <Map 
        defaultCenter={mapCenter} 
        defaultZoom={14} 
        mapId="DEMO_MAP_ID"
        disableDefaultUI={true}
        gestureHandling="greedy"
      >
        <MapUpdater center={mapCenter} />
        {places.map((place) => (
          <AdvancedMarker 
            key={place.id} 
            position={place.location}
            zIndex={hoveredPlaceId === place.id ? 100 : 1}
          >
            <Pin 
              background={CATEGORY_COLORS[place.category] || '#FF6F61'}
              borderColor={'#fff'}
              glyphColor={'#fff'}
              scale={hoveredPlaceId === place.id ? 1.3 : 1}
            />
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}
