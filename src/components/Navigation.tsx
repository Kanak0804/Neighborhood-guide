"use client";
import Link from 'next/link';
import { Map, Heart, Sun, Moon, MapPin, Globe, Check } from 'lucide-react';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useTheme } from 'next-themes';
import { useEffect, useState, useRef } from 'react';
import LoginModal from '@/components/LoginModal';
import { useTranslation } from '@/i18n/TranslationContext';
import { LanguageCode } from '@/i18n/translations';

const languages: { code: LanguageCode, name: string }[] = [
  { code: 'EN', name: 'English (US)' },
  { code: 'HI', name: 'हिंदी (Hindi)' },
  { code: 'MR', name: 'मराठी (Marathi)' },
  { code: 'GU', name: 'ગુજરાતી (Gujarati)' },
  { code: 'TA', name: 'தமிழ் (Tamil)' },
  { code: 'TE', name: 'తెలుగు (Telugu)' },
  { code: 'ES', name: 'Español (Spanish)' },
  { code: 'FR', name: 'Français (French)' }
];

export default function Navigation() {
  const { favorites } = useFavoritesStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  
  const { language, setLanguage, t } = useTranslation();

  useEffect(() => {
    setMounted(true);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLoginSuccess = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data.city) {
        const locString = `${data.city}, ${data.region}`;
        window.dispatchEvent(new CustomEvent('login-location-ready', { detail: locString }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
    <nav className="sticky top-0 z-40 glassmorphism border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center shadow-lg shadow-accent/20 group-hover:shadow-accent/40 transition-all">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-sora font-bold tracking-tight text-foreground dark:text-white">
                Localite<span className="text-accent">.</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/map" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden sm:block">
              <Map className="w-5 h-5 text-foreground" />
            </Link>
            <Link href="/favorites" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
              <Heart className="w-5 h-5 text-foreground" />
              {favorites.length > 0 && (
                <span className="absolute top-1 right-1 bg-accent text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                  {favorites.length}
                </span>
              )}
            </Link>
            
            <div className="relative" ref={langDropdownRef}>
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={t('nav.select_language')}
              >
                <Globe className="w-5 h-5 text-foreground" />
                <span className="text-xs font-semibold hidden sm:block">{language}</span>
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0f0f13] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 pb-2 mb-2 border-b border-gray-100 dark:border-white/5 text-xs font-semibold text-gray-500">
                    {t('nav.select_language')}
                  </div>
                  <div className="max-h-64 overflow-y-auto scrollbar-hide">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <span className={`font-inter ${language === lang.code ? 'font-semibold text-accent' : 'text-foreground'}`}>
                          {lang.name}
                        </span>
                        {language === lang.code && <Check className="w-4 h-4 text-accent" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {mounted && (
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-1"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-700" />}
              </button>
            )}
            
            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-4 py-2 bg-foreground text-background dark:bg-white dark:text-black rounded-full text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm ml-1 whitespace-nowrap"
            >
              {t('nav.login')}
            </button>
          </div>
        </div>
      </div>
    </nav>
    <LoginModal 
      isOpen={isLoginOpen} 
      onClose={() => setIsLoginOpen(false)} 
      onSuccess={handleLoginSuccess} 
    />
    </>
  );
}
