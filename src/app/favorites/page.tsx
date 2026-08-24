"use client";

import Navigation from '@/components/Navigation';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function FavoritesPage() {
  const { favorites } = useFavoritesStore();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-sora font-bold mb-8">My Favorites</h1>
        {favorites.length === 0 ? (
          <div className="text-center text-gray-500 py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-soft">
            <h2 className="text-xl font-medium mb-2">No favorites yet</h2>
            <p>Start exploring and click the heart icon on places to save them here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((place) => (
              <Link href={`/place/${place.id}`} key={place.id}>
                <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group h-full flex flex-col">
                  <div className="h-48 w-full relative bg-gray-200">
                    {place.photos && place.photos.length > 0 ? (
                      <Image 
                        src={`/api/photo?name=${typeof place.photos[0] === 'string' ? place.photos[0] : (place.photos[0] as any).name}&maxWidth=800&maxHeight=800`} 
                        alt={place.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-sora font-semibold text-lg line-clamp-1">{place.name}</h3>
                    <div className="flex items-center gap-1 text-sm mt-1 text-yellow-500 mb-2">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{place.rating}</span>
                    </div>
                    <div className="flex items-start gap-1 text-xs text-gray-500 mt-auto">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="line-clamp-2">{place.address}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
