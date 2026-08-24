"use client";

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import MapComponent from '@/components/MapComponent';
import { useFilterStore } from '@/store/useFilterStore';
import { Place } from '@/types';

export default function GlobalMapPage() {
  const { searchQuery } = useFilterStore();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlaces() {
      setLoading(true);
      try {
        const area = searchQuery || 'Indore';
        const res = await fetch('/api/places', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: 'restaurant', area })
        });
        const data = await res.json();
        if (data.places) setPlaces(data.places);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchPlaces();
  }, [searchQuery]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">

      <div className="flex-1 w-full h-full relative">
        <MapComponent places={places} />
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
          </div>
        )}
      </div>
    </div>
  );
}
