"use client";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Place } from '@/types';
import Navigation from '@/components/Navigation';
import MapComponent from '@/components/MapComponent';
import { Star, Search } from 'lucide-react';
import Image from 'next/image';
import { useFilterStore } from '@/store/useFilterStore';

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryType = params.type as string;
  const { searchQuery } = useFilterStore();
  const area = searchParams.get('area') || searchQuery || '';
  
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    async function fetchPlaces() {
      if (!area) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch('/api/places', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: categoryType,
            area: area
          })
        });
        const data = await res.json();
        if (data.places) setPlaces(data.places);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchPlaces();
  }, [categoryType, area]);

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    router.push(`/category/${categoryType}?area=${encodeURIComponent(searchInput)}`);
  };

  const categoryImages: Record<string, string> = {
    restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800',
    cafe: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800',
    hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800',
    attraction: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800',
    default: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800'
  };
  const bgImage = categoryImages[categoryType as string] || categoryImages.default;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left List */}
        <div className={`w-full md:w-1/2 lg:w-2/5 overflow-y-auto ${!area ? '' : 'p-4'} bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col`}>
          {!area ? (
            <div className="relative flex flex-col items-center justify-center h-full w-full text-center p-8 flex-1 overflow-hidden group">
              <div 
                className="absolute inset-0 bg-cover bg-center z-0 scale-105 transition-transform duration-[10s] group-hover:scale-110" 
                style={{ backgroundImage: `url('${bgImage}')` }}
              />
              <div className="absolute inset-0 bg-black/40 dark:bg-black/60 z-10" />
              
              <div className="relative z-20 bg-white/20 dark:bg-black/40 backdrop-blur-md border border-white/30 dark:border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-2xl">
                <div className="w-16 h-16 bg-accent/90 rounded-2xl flex items-center justify-center text-white mb-6 mx-auto shadow-lg shadow-accent/30 rotate-3 transition-transform hover:rotate-0">
                  <Search className="w-7 h-7" />
                </div>
                <h1 className="text-3xl font-sora font-bold mb-3 capitalize text-white drop-shadow-sm">Find {categoryType}s</h1>
                <p className="text-white/90 mb-8 text-sm font-medium">Enter a neighborhood or city to explore the best {categoryType}s in that area.</p>
                
                <div className="w-full flex bg-white dark:bg-[#111] rounded-xl shadow-inner p-1.5 transition-all focus-within:ring-2 focus-within:ring-accent focus-within:shadow-lg">
                  <input 
                    type="text" 
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 bg-transparent px-4 py-2 outline-none text-sm text-gray-900 dark:text-white font-medium"
                    placeholder="E.g. Bandra, Mumbai"
                  />
                  <button 
                    onClick={handleSearch}
                    disabled={!searchInput.trim()}
                    className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-accent/90 disabled:opacity-50 transition-all shadow-md"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-sora font-bold mb-6 capitalize">{categoryType}s in {area}</h1>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 h-32 animate-pulse shadow-sm" />
                  ))}
                </div>
              ) : places.length === 0 ? (
            <div className="text-center text-gray-500 py-10">No places found. Check if your API key has &quot;Places API (New)&quot; enabled in Google Cloud.</div>
          ) : (
            <div className="space-y-4">
              {places.map(place => (
                <div 
                  key={place.id}
                  onClick={() => router.push(`/place/${place.id}`)}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 dark:border-gray-700 flex gap-4"
                  onMouseEnter={() => setHoveredId(place.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                    {place.photos && place.photos.length > 0 ? (
                      <Image 
                        src={`/api/photo?name=${place.photos[0]}`} 
                        alt={place.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-sora font-semibold text-lg line-clamp-1">{place.name}</h3>
                    <div className="flex items-center gap-1 text-sm mt-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{place.rating}</span>
                      <span className="text-gray-400">({place.userRatingCount})</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{place.address}</p>
                    <div className="mt-2 text-xs">
                      {place.openNow ? (
                        <span className="text-green-600 font-medium">Open Now</span>
                      ) : (
                        <span className="text-red-500">Closed</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </>
        )}
        </div>
        
        {/* Right Map */}
        <div className="hidden md:block w-full md:w-1/2 lg:w-3/5 h-full relative bg-gray-100">
          <MapComponent places={places} hoveredPlaceId={hoveredId} />
        </div>
      </div>
    </div>
  );
}
