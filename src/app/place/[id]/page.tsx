"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import { Star, MapPin, Clock, Phone, Globe, Navigation as NavIcon, X, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { motion, AnimatePresence } from 'framer-motion';
import { useFavoritesStore } from '@/store/useFavoritesStore';

export default function PlaceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [place, setPlace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();

  useEffect(() => {
    async function fetchPlace() {
      try {
        const res = await fetch(`/api/place?id=${id}`);
        const data = await res.json();
        setPlace(data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    if (id) fetchPlace();
  }, [id]);

  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">

        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  if (!place) {
    return <div className="p-10 text-center">Place not found</div>;
  }

  const handleDirections = () => {
    const lat = place.location?.latitude;
    const lng = place.location?.longitude;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${place.id}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">

      
      {/* Photos Hero Grid */}
      <div className="h-[40vh] md:h-[50vh] w-full max-w-7xl mx-auto md:p-4 md:gap-4 md:grid md:grid-cols-4 md:grid-rows-2 flex overflow-x-auto snap-x">
        {place.photos && place.photos.length > 0 ? (
          <>
            <div 
              className="h-full w-full min-w-[90%] md:min-w-0 md:h-auto snap-center md:col-span-2 md:row-span-2 relative md:rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setSelectedImageIndex(0)}
            >
              <Image 
                src={`/api/photo?name=${place.photos[0].name}&maxWidth=1200&maxHeight=1200`} 
                alt="Main photo" 
                fill 
                className="object-cover" 
              />
            </div>
            {place.photos.slice(1, 5).map((photo: any, i: number) => (
              <div 
                key={i} 
                className="h-full w-full min-w-[80%] md:min-w-0 md:h-auto snap-center relative md:rounded-2xl overflow-hidden shadow-sm hidden md:block cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedImageIndex(i + 1)}
              >
                <Image 
                  src={`/api/photo?name=${photo.name}&maxWidth=800&maxHeight=800`} 
                  alt="Photo" 
                  fill 
                  className="object-cover" 
                />
              </div>
            ))}
          </>
        ) : (
          <div className="md:col-span-4 md:row-span-2 w-full h-full bg-gray-200 md:rounded-2xl flex items-center justify-center text-gray-500">
            No photos available
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="bg-card rounded-2xl shadow-soft p-6 md:p-8 flex flex-col md:flex-row gap-8">
          
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-3xl font-sora font-bold">{place.displayName?.text}</h1>
              <button 
                onClick={() => {
                  const p = {
                    id: place.id,
                    name: place.displayName?.text || 'Unknown',
                    rating: place.rating || 0,
                    userRatingCount: place.userRatingCount || 0,
                    address: place.formattedAddress || '',
                    photos: place.photos || [],
                    location: {
                      lat: place.location?.latitude,
                      lng: place.location?.longitude,
                    },
                    category: 'favorite',
                    openNow: place.regularOpeningHours?.openNow || false,
                    priceLevel: place.priceLevel || 'PRICE_LEVEL_UNSPECIFIED',
                    types: place.types || []
                  };
                  if (isFavorite(place.id)) {
                    removeFavorite(place.id);
                  } else {
                    addFavorite(p as any);
                  }
                }}
                className="p-3 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-800 dark:bg-gray-800 flex-shrink-0"
              >
                <Heart className={`w-6 h-6 ${isFavorite(place.id) ? 'fill-accent text-accent' : 'text-gray-400'}`} />
              </button>
            </div>
            
            <div className="flex items-center gap-4 text-sm mb-6">
              <div className="flex items-center gap-1 text-yellow-500 font-medium">
                <Star className="w-5 h-5 fill-current" />
                <span className="text-lg">{place.rating || 'N/A'}</span>
                <span className="text-gray-400">({place.userRatingCount || 0} reviews)</span>
              </div>
              {place.priceLevel && (
                <div className="text-gray-600 font-medium">
                  {Array(place.priceLevel === 'PRICE_LEVEL_INEXPENSIVE' ? 1 : place.priceLevel === 'PRICE_LEVEL_MODERATE' ? 2 : place.priceLevel === 'PRICE_LEVEL_EXPENSIVE' ? 3 : 4).fill('$').join('')}
                </div>
              )}
            </div>

            <div className="space-y-4 text-gray-600 dark:text-gray-300 font-inter">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span>{place.formattedAddress}</span>
              </div>
              
              {place.currentOpeningHours && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <span className={place.currentOpeningHours.openNow ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                      {place.currentOpeningHours.openNow ? 'Open Now' : 'Closed'}
                    </span>
                  </div>
                </div>
              )}

              {place.nationalPhoneNumber && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>{place.nationalPhoneNumber}</span>
                </div>
              )}

              {place.websiteUri && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-accent flex-shrink-0" />
                  <a href={place.websiteUri} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline line-clamp-1">
                    {place.websiteUri}
                  </a>
                </div>
              )}
            </div>

            <button 
              onClick={handleDirections}
              className="mt-8 w-full md:w-auto flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-xl font-medium hover:bg-accent/90 transition-all shadow-lg hover:shadow-accent/30 hover:-translate-y-1"
            >
              <NavIcon className="w-5 h-5" />
              Get Directions
            </button>
          </div>

          <div className="w-full md:w-1/3 h-[300px] rounded-xl overflow-hidden bg-gray-100 shadow-inner">
            {mapsApiKey && place.location && (
              <APIProvider apiKey={mapsApiKey}>
                <Map 
                  defaultCenter={{ lat: place.location.latitude, lng: place.location.longitude }} 
                  defaultZoom={15} 
                  mapId="DEMO_MAP_ID"
                  disableDefaultUI={true}
                >
                  <AdvancedMarker position={{ lat: place.location.latitude, lng: place.location.longitude }}>
                    <Pin background={'#FF6F61'} borderColor={'#fff'} glyphColor={'#fff'} />
                  </AdvancedMarker>
                </Map>
              </APIProvider>
            )}
          </div>
          
        </div>
      </div>
      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {selectedImageIndex !== null && place.photos && place.photos[selectedImageIndex] && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedImageIndex(null)}
          >
            <button 
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
              onClick={() => setSelectedImageIndex(null)}
            >
              <X className="w-6 h-6" />
            </button>

            {selectedImageIndex > 0 && (
              <button 
                className="absolute left-4 md:left-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
                onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(selectedImageIndex - 1); }}
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            {selectedImageIndex < place.photos.length - 1 && (
              <button 
                className="absolute right-4 md:right-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
                onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(selectedImageIndex + 1); }}
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}

            <motion.div 
              key={selectedImageIndex}
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-5xl aspect-[4/3] md:aspect-[16/9] max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image 
                src={`/api/photo?name=${place.photos[selectedImageIndex].name}&maxWidth=1600&maxHeight=1600`} 
                alt="Enlarged view" 
                fill 
                className="object-contain" 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
