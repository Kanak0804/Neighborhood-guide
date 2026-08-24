"use client";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Utensils, Coffee, BedDouble, Trees, ShoppingBag, Landmark, Ticket, Search, LocateFixed, Star, ThumbsUp, Map as MapIcon, ChevronRight } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useFilterStore } from '@/store/useFilterStore';
import { useTranslation } from '@/i18n/TranslationContext';

const CATEGORIES = [
  { id: 'hotel', label: 'Hotels', icon: BedDouble },
  { id: 'cafe', label: 'Cafes', icon: Coffee },
  { id: 'restaurant', label: 'Restaurants', icon: Utensils },
  { id: 'park', label: 'Parks', icon: Trees },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'attraction', label: 'Attractions', icon: Landmark },
  { id: 'thingstodo', label: 'Things', icon: Ticket },
  { id: 'map', label: 'Map', icon: MapIcon },
];

export default function Home() {
  const { t } = useTranslation();
  const { searchQuery, setSearchQuery } = useFilterStore();
  const [searchInput, setSearchInput] = useState('');
  const [searchedArea, setSearchedArea] = useState('');
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [topHotels, setTopHotels] = useState<any[]>([]);
  const [topCafes, setTopCafes] = useState<any[]>([]);
  const HERO_IMAGES = [
    "https://images.unsplash.com/photo-1514924013411-cce2d6f27100?q=80&w=2000",
    "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2000",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2000",
    "https://images.unsplash.com/photo-1542314831-c6a4d14eff51?q=80&w=2000"
  ];
  const ACTIVITIES = ['Dinner', 'Coffee', 'a Stay', 'Fun', 'Shopping'];
  const [currentActivity, setCurrentActivity] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollWidth > clientWidth) {
        const progress = scrollLeft / (scrollWidth - clientWidth);
        const totalItems = 7;
        setActiveDot(Math.min(totalItems - 1, Math.max(0, Math.round(progress * (totalItems - 1)))));
      }
    }
  };

  useEffect(() => {
    const textInterval = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % ACTIVITIES.length);
    }, 10000);
    const imgInterval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => {
      clearInterval(textInterval);
      clearInterval(imgInterval);
    };
  }, []);

  const fetchSummary = async (areaToSearch: string) => {
    setSearchedArea(areaToSearch);
    setSearchQuery(areaToSearch);
    setLoadingSummary(true);
    try {
      const [res, hotelsRes, cafesRes] = await Promise.all([
        fetch('/api/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ areaName: areaToSearch, places: [{ name: 'popular local spots' }] })
        }),
        fetch('/api/places', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: 'hotel', area: areaToSearch })
        }),
        fetch('/api/places', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: 'cafe', area: areaToSearch })
        })
      ]);
      const data = await res.json();
      setSummary(data.summary || `A wonderful neighborhood to explore. Experience the best of ${areaToSearch}.`);
      
      const hotelsData = await hotelsRes.json();
      const cafesData = await cafesRes.json();
      setTopHotels(hotelsData.places?.slice(0, 2) || []);
      setTopCafes(cafesData.places?.slice(0, 2) || []);
    } catch (e) {
      // Mock data so the dashboard works perfectly without a backend
      setSummary(`Welcome to ${areaToSearch}! This area is known for its vibrant culture, amazing local street food, and beautiful scenic spots. It's a great place to explore whether you are looking for a weekend getaway or a long vacation.`);
      setTopHotels([
        { name: `Grand ${areaToSearch} Plaza`, rating: '4.8' },
        { name: 'The Royal Retreat', rating: '4.5' }
      ]);
      setTopCafes([
        { name: 'Brew & Bake Cafe', rating: '4.7' },
        { name: 'Local Roasters', rating: '4.6' }
      ]);
    }
    setLoadingSummary(false);
  };

  useEffect(() => {
    // Clear the persisted search on reload so it defaults to the hero screen
    useFilterStore.getState().setSearchQuery('');
    
    // Force scroll to top on reload
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
    }

    const handleLoginLocation = (e: any) => {
      const loc = e.detail;
      setSearchInput(loc);
      window.history.pushState({ view: 'dashboard', area: loc }, '', '');
      fetchSummary(loc);
    };

    window.addEventListener('login-location-ready', handleLoginLocation);
    
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.view === 'dashboard') {
        setSearchInput(e.state.area);
        fetchSummary(e.state.area);
      } else {
        setSearchedArea('');
        setSummary('');
        setSearchInput('');
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('login-location-ready', handleLoginLocation);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleLiveLocation = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (!res.ok) throw new Error("Rate limited");
      const data = await res.json();
      if (data.city) {
        const locString = `${data.city}, ${data.region}`;
        setSearchInput(locString);
        window.history.pushState({ view: 'dashboard', area: locString }, '', '');
        fetchSummary(locString);
      }
    } catch (e) {
      // Fallback if location API fails (e.g. adblocker or rate limit)
      const locString = "Mumbai, Maharashtra";
      setSearchInput(locString);
      window.history.pushState({ view: 'dashboard', area: locString }, '', '');
      fetchSummary(locString);
    }
  };

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    window.history.pushState({ view: 'dashboard', area: searchInput }, '', '');
    fetchSummary(searchInput);
  };

  return (
    <main className="min-h-screen">
      
      {!searchedArea ? (
        <section className="relative h-[80vh] flex flex-col items-center justify-center overflow-hidden">
          <AnimatePresence>
            <motion.div 
              key={currentImage}
              className="absolute inset-0 z-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${HERO_IMAGES[currentImage]}')` }}
              initial={{ scale: 1.05, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 z-10 bg-black/40" />
          {/* CSS Particles */}
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-white rounded-full opacity-30"
                style={{
                  width: Math.random() * 4 + 1 + 'px',
                  height: Math.random() * 4 + 1 + 'px',
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                }}
                animate={{
                  y: [0, -100 - Math.random() * 100],
                  opacity: [0, 0.8, 0],
                  x: Math.random() * 50 - 25,
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: Math.random() * 5,
                }}
              />
            ))}
          </div>
          
          <div className="relative z-20 text-center px-4 w-full max-w-3xl">
            <motion.h1 
              className="text-4xl md:text-6xl font-sora font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {t('hero.title.where')} {t('hero.title.for')} <br/>
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentActivity}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400 inline-block mt-2 min-w-[200px]"
                >
                  {ACTIVITIES[currentActivity]}?
                </motion.span>
              </AnimatePresence>
            </motion.h1>
            
            <motion.div 
              className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-2 shadow-2xl mx-auto max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <MapPin className="text-white/70 ml-4 w-6 h-6" />
              <input 
                type="text" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 bg-transparent px-4 py-3 outline-none text-white text-lg font-inter placeholder-white/50"
                placeholder={t('hero.search.placeholder')}
              />
              <button
                onClick={handleLiveLocation}
                title="Use my current location"
                className="text-white/70 hover:text-white transition-colors px-3 border-r border-white/20 mr-2"
              >
                <LocateFixed className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSearch}
                className="bg-accent text-white px-8 py-3 rounded-full font-medium hover:bg-accent/90 transition-colors flex items-center gap-2 shadow-[0_0_8px_rgba(255,111,97,0.25)]"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">{t('hero.search.btn')}</span>
              </button>
            </motion.div>

            <motion.div
              className="mt-6 flex flex-wrap justify-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <button onClick={() => {setSearchInput('Dubai'); fetchSummary('Dubai');}} className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium backdrop-blur-md transition-colors border border-white/10">
                {t('hero.chips.malls')}
              </button>
              <button onClick={() => {setSearchInput('Paris'); fetchSummary('Paris');}} className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium backdrop-blur-md transition-colors border border-white/10">
                {t('hero.chips.cafes')}
              </button>
              <button onClick={() => {setSearchInput('Miami'); fetchSummary('Miami');}} className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium backdrop-blur-md transition-colors border border-white/10">
                {t('hero.chips.clubs')}
              </button>
              <button
                onClick={handleLiveLocation}
                className="px-4 py-2 rounded-full bg-accent hover:bg-accent/90 text-white text-sm font-bold shadow-[0_0_8px_rgba(255,111,97,0.25)] flex items-center gap-2 transition-all"
              >
                <LocateFixed className="w-4 h-4" />
                {t('hero.chips.nearme')}
              </button>
            </motion.div>
          </div>
        </section>
      ) : (
        <>
          <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.05] dark:opacity-10 grayscale">
        {/* Background Images Slider */}
        <AnimatePresence>
          <motion.div 
            key={currentImage}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${HERO_IMAGES[currentImage]}')` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          />
        </AnimatePresence>
      </div>
          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 relative z-10"
            >
              <div className="text-center mb-10">
                <h1 className="text-3xl md:text-5xl font-sora font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-fuchsia-500 to-accent">
                  {t('dash.uncover') || "Uncover the Best of the Neighborhood"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 font-inter text-lg mb-8">
                  {t('dash.exploring') || "Currently exploring"} <strong className="text-foreground dark:text-white">{searchedArea}</strong>
                </p>
              <div className="flex items-center bg-black/40 dark:bg-black/60 backdrop-blur-xl border border-gray-300 dark:border-white/10 rounded-full p-2 shadow-2xl mx-auto max-w-2xl group focus-within:border-accent/50 focus-within:shadow-[0_0_20px_rgba(255,111,97,0.2)] transition-all">
                <Search className="text-gray-500 dark:text-gray-400 ml-4 w-5 h-5" />
                <input 
                  type="text" 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 bg-transparent px-4 py-2 outline-none text-foreground text-lg font-inter placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder={t('dash.search.ph') || "Search or ask AI..."}
                />
                <button
                  onClick={handleLiveLocation}
                  className="text-gray-500 hover:text-accent transition-colors px-3 mr-2"
                >
                  <LocateFixed className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleSearch}
                  className="bg-accent text-white p-3 rounded-full hover:bg-accent/90 transition-all hover:scale-105 shadow-[0_0_10px_rgba(255,111,97,0.4)]"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {CATEGORIES.map((cat, i) => (
                <Link href={cat.id === 'map' ? '/map' : `/category/${cat.id}?area=${encodeURIComponent(searchedArea)}`} key={cat.id}>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="w-24 h-24 bg-card dark:bg-[#111] rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer border border-gray-200 dark:border-white/5 hover:border-accent/40 dark:hover:border-accent/40 hover:shadow-[0_0_15px_rgba(255,111,97,0.15)] transition-all group"
                  >
                    <cat.icon className="w-7 h-7 text-gray-600 dark:text-gray-400 group-hover:text-accent transition-colors" />
                    <span className="text-xs font-inter font-medium text-gray-700 dark:text-gray-300">{t(`cat.${cat.id}`) || cat.label}</span>
                  </motion.div>
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="col-span-1 md:col-span-1 bg-card dark:bg-[#111] rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-soft relative overflow-hidden group hover:border-blue-500/30 transition-colors flex flex-col"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-sora font-bold text-foreground">{t('dash.qs.title') || "Quick Start Guide"}</h3>
                  <div className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star className="w-3 h-3" /> AI
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('dash.qs.desc') || "Your AI concierge for"} {searchedArea}</p>
                {loadingSummary ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded w-4/6"></div>
                  </div>
                ) : (
                  <ul className="space-y-3 mb-6">
                    {summary.split('. ').slice(0, 3).map((sentence, idx) => sentence && (
                      <li key={idx} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300 font-inter">
                        <span className="text-accent">•</span> {sentence.trim()}.
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-auto">
                  <button className="w-full bg-gray-100 dark:bg-gray-800 text-foreground py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex justify-center items-center gap-2">
                    <Search className="w-4 h-4" /> {t('dash.qs.btn') || "Start AI Chat"}
                  </button>
                </div>
              </motion.div>

              <Link href={`/category/hotel?area=${encodeURIComponent(searchedArea)}`} className="col-span-1 md:col-span-1 block h-full">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card dark:bg-[#111] h-full rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-soft relative overflow-hidden group hover:border-accent/40 transition-colors"
                >
                  <div className="absolute inset-0 opacity-20 dark:opacity-40 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800')] bg-cover bg-center group-hover:scale-110 transition-transform duration-700"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 dark:to-[#111]"></div>
                  
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-sora font-bold text-white dark:text-foreground">{t('dash.hotels.title') || "Hotels & Stays"}</h3>
                        <p className="text-sm text-white/70 dark:text-gray-400">{t('dash.hotels.desc') || "Curated luxury & comfort"}</p>
                      </div>
                      <div className="bg-accent/20 backdrop-blur-md text-accent px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-accent/30">
                        <Star className="w-3 h-3 fill-accent" /> 40+
                      </div>
                    </div>
                    <div className="space-y-2 mt-12">
                      {topHotels.length > 0 ? topHotels.map((hotel, idx) => (
                         <div key={idx} className="bg-black/40 backdrop-blur-sm rounded-xl p-3 flex justify-between items-center border border-white/10 overflow-hidden gap-2">
                           <span className="text-sm font-medium text-white truncate flex-1 min-w-0">{hotel.name}</span>
                           <div className="flex gap-1 items-center bg-black/50 px-2 py-0.5 rounded text-yellow-400 font-bold text-xs shrink-0"><Star className="w-3 h-3 fill-yellow-400"/> {hotel.rating || 'New'}</div>
                         </div>
                      )) : (
                        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-3 flex justify-between items-center border border-white/10">
                          <span className="text-sm font-medium text-white">{t('dash.loading') || "Loading..."}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Link>

              <Link href={`/category/cafe?area=${encodeURIComponent(searchedArea)}`} className="col-span-1 md:col-span-1 block h-full">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card dark:bg-[#111] h-full rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-soft relative overflow-hidden group hover:border-purple-500/40 transition-colors"
                >
                  <div className="absolute inset-0 opacity-20 dark:opacity-40 bg-[url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800')] bg-cover bg-center group-hover:scale-110 transition-transform duration-700"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 dark:to-[#111]"></div>
                  
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-sora font-bold text-white dark:text-foreground">{t('dash.cafes.title') || "Cafes & Dining"}</h3>
                        <p className="text-sm text-white/70 dark:text-gray-400">{t('dash.cafes.desc') || "Discover local flavors"}</p>
                      </div>
                      <div className="bg-purple-500/20 text-purple-500 dark:text-purple-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-purple-500/30">
                        <ThumbsUp className="w-3 h-3" /> Best
                      </div>
                    </div>
                    
                    <div className="mt-8 space-y-3">
                      {topCafes.length > 0 ? topCafes.map((cafe, idx) => (
                        <div key={idx} className="flex gap-3 items-center bg-black/40 backdrop-blur-sm border border-white/5 rounded-xl p-2 overflow-hidden group/item hover:border-purple-500/30 transition-colors">
                          <div className="w-14 h-14 shrink-0 rounded-lg bg-cover bg-center" style={{ backgroundImage: cafe.photos && cafe.photos.length > 0 ? `url(/api/photo?name=${cafe.photos[0]}&maxWidthPx=400)` : "url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=400')" }} />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-white truncate">{cafe.name}</h4>
                            <div className="flex items-center gap-1 mt-1 text-xs text-purple-400 font-medium">
                              <Star className="w-3 h-3 fill-purple-400"/> {cafe.rating || 'New'}
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="h-32 flex items-center justify-center"><span className="text-gray-500">{t('dash.loading') || "Loading..."}</span></div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Link>
              {/* Restaurants Preview */}
              <Link href={`/category/restaurant?area=${encodeURIComponent(searchedArea)}`} className="col-span-1 md:col-span-2 block h-full">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-card dark:bg-[#111] h-full rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-soft relative overflow-hidden group hover:border-orange-500/40 transition-colors"
                >
                  <div className="absolute inset-0 opacity-20 dark:opacity-40 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200')] bg-cover bg-center group-hover:scale-110 transition-transform duration-700"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 dark:from-[#111] to-transparent"></div>
                  
                  <div className="relative z-10 flex flex-col h-full justify-center w-full md:w-2/3">
                    <h3 className="text-2xl font-sora font-bold text-white dark:text-foreground mb-2">{t('dash.res.title') || "Restaurants & Fine Dining"}</h3>
                    <p className="text-sm text-white/70 dark:text-gray-400 mb-6">{t('dash.res.desc') || "Experience culinary masterpieces and local street food favorites"}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-orange-500/20 text-orange-500 px-3 py-1 rounded-full text-xs font-bold border border-orange-500/30">{t('dash.res.gourmet') || "Gourmet"}</span>
                      <span className="bg-orange-500/20 text-orange-500 px-3 py-1 rounded-full text-xs font-bold border border-orange-500/30">{t('dash.res.local') || "Local Eateries"}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>

              {/* Parks Preview */}
              <Link href={`/category/park?area=${encodeURIComponent(searchedArea)}`} className="col-span-1 md:col-span-1 block h-full">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-card dark:bg-[#111] h-full rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-soft relative overflow-hidden group hover:border-green-500/40 transition-colors flex flex-col justify-end"
                >
                  <div className="absolute inset-0 opacity-40 dark:opacity-60 bg-[url('https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=600')] bg-cover bg-center group-hover:scale-110 transition-transform duration-700"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  
                  <div className="relative z-10">
                    <h3 className="text-xl font-sora font-bold text-white">{t('dash.parks.title') || "Parks & Nature"}</h3>
                    <p className="text-xs text-gray-300 mt-1">{t('dash.parks.desc') || "Escape to greenery"}</p>
                  </div>
                </motion.div>
              </Link>

              {/* Shopping Preview */}
              <Link href={`/category/shopping?area=${encodeURIComponent(searchedArea)}`} className="col-span-1 md:col-span-1 block h-full">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-card dark:bg-[#111] h-full rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-soft relative overflow-hidden group hover:border-pink-500/40 transition-colors flex flex-col justify-end"
                >
                  <div className="absolute inset-0 opacity-40 dark:opacity-60 bg-[url('https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600')] bg-cover bg-center group-hover:scale-110 transition-transform duration-700"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  
                  <div className="relative z-10">
                    <h3 className="text-xl font-sora font-bold text-white">{t('dash.shop.title') || "Shopping"}</h3>
                    <p className="text-xs text-gray-300 mt-1">{t('dash.shop.desc') || "Malls & Boutiques"}</p>
                  </div>
                </motion.div>
              </Link>

              {/* Attractions Preview */}
              <Link href={`/category/attraction?area=${encodeURIComponent(searchedArea)}`} className="col-span-1 md:col-span-1 block h-full">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="bg-card dark:bg-[#111] h-full rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-soft relative overflow-hidden group hover:border-yellow-500/40 transition-colors flex flex-col justify-end"
                >
                  <div className="absolute inset-0 opacity-40 dark:opacity-60 bg-[url('https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=600')] bg-cover bg-center group-hover:scale-110 transition-transform duration-700"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  
                  <div className="relative z-10">
                    <h3 className="text-xl font-sora font-bold text-white">{t('dash.attr.title') || "Attractions"}</h3>
                    <p className="text-xs text-gray-300 mt-1">{t('dash.attr.desc') || "Must-visit landmarks"}</p>
                  </div>
                </motion.div>
              </Link>

              {/* Things to do Preview */}
              <Link href={`/category/thingstodo?area=${encodeURIComponent(searchedArea)}`} className="col-span-1 md:col-span-1 block h-full">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="bg-card dark:bg-[#111] h-full rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-soft relative overflow-hidden group hover:border-teal-500/40 transition-colors flex flex-col justify-end"
                >
                  <div className="absolute inset-0 opacity-40 dark:opacity-60 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600')] bg-cover bg-center group-hover:scale-110 transition-transform duration-700"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  
                  <div className="relative z-10">
                    <h3 className="text-xl font-sora font-bold text-white">{t('dash.todo.title') || "Things to Do"}</h3>
                    <p className="text-xs text-gray-300 mt-1">{t('dash.todo.desc') || "Activities & Events"}</p>
                  </div>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
        </>
      )}

      <section id="trending" className="py-20 bg-gray-50 dark:bg-transparent border-t border-gray-100 dark:border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-sora font-bold mb-4">{t('home.trending.title') || "Trending Destinations"}</h2>
            <p className="text-gray-500 dark:text-gray-400">{t('home.trending.desc') || "Explore the most popular cities around the world"}</p>
          </div>
          <div className="relative w-full overflow-hidden group">
            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-6 pb-6 pt-2" 
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {[
                { name: 'Mumbai, India', img: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?q=80&w=800' },
                { name: 'Jaipur, India', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800' },
                { name: 'Goa, India', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800' },
                { name: 'Kyoto, Japan', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800' },
                { name: 'New York, USA', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800' },
                { name: 'Rome, Italy', img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800' },
                { name: 'Sydney, Australia', img: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=800' },
              ].map((city, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => { 
                    setSearchInput(city.name); 
                    window.history.pushState({ view: 'dashboard', area: city.name }, '', '');
                    fetchSummary(city.name); 
                    window.scrollTo({ top: 0, behavior: 'smooth' }); 
                  }}
                  className="group relative h-[380px] w-full md:w-[calc((100%-3rem)/3)] rounded-[2rem] overflow-hidden cursor-pointer shadow-soft hover:shadow-2xl transition-all border border-gray-200 dark:border-white/10 snap-start flex-shrink-0"
                >
                  <img src={city.img} alt={city.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-8 left-6 right-6">
                    <h3 className="text-white text-2xl font-sora font-bold">{t(`city.${city.name}`) || city.name}</h3>
                    <p className="text-white/80 text-sm mt-2 flex items-center gap-2 group-hover:text-accent transition-colors font-medium">
                      {t('home.explore') || "Explore"} <MapPin className="w-4 h-4" />
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Dots */}
            <div className="flex justify-center gap-2 mt-4 pb-2">
              {[...Array(7)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2 rounded-full transition-all duration-500 ease-out ${i === activeDot ? 'w-8 bg-accent shadow-[0_0_10px_rgba(255,111,97,0.5)]' : 'w-2 bg-gray-300 dark:bg-white/20'}`} 
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-sora font-bold mb-4">{t('home.how.title') || "How Localite Works"}</h2>
            <p className="text-gray-500 dark:text-gray-400">{t('home.how.desc') || "Your ultimate guide in three simple steps"}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              { icon: Search, title: t('home.how.step1.title') || "1. Search Any Area", desc: t('home.how.step1.desc') || "Type your city or neighborhood to instantly fetch local data." },
              { icon: MapPin, title: t('home.how.step2.title') || "2. Explore Categories", desc: t('home.how.step2.desc') || "Browse through restaurants, cafes, hotels, and attractions." },
              { icon: Ticket, title: t('home.how.step3.title') || "3. Plan Your Visit", desc: t('home.how.step3.desc') || "Get AI summaries, directions, and save your favorite spots." },
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center group"
              >
                <div className="w-20 h-20 bg-accent/10 dark:bg-accent/5 rounded-3xl flex items-center justify-center mb-6 text-accent rotate-3 group-hover:rotate-0 transition-transform border border-accent/20 shadow-[0_0_15px_rgba(255,111,97,0.1)]">
                  <step.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-sora font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-inter">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
