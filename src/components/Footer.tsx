"use client";
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { useTranslation } from '@/i18n/TranslationContext';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-white dark:bg-black border-t border-gray-100 dark:border-gray-900 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group mb-4 inline-flex">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(255,111,97,0.3)] group-hover:shadow-[0_0_20px_rgba(255,111,97,0.5)] transition-all">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-sora font-bold tracking-tight text-foreground dark:text-white">
                Localite<span className="text-accent">.</span>
              </span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 font-inter text-sm leading-relaxed mb-6">
              {t('footer.desc')}
            </p>
            <div className="flex space-x-4">
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent transition-colors font-semibold">
                X
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent transition-colors font-semibold">
                IG
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-sora font-semibold text-lg mb-4 text-foreground">{t('footer.explore')}</h3>
            <ul className="space-y-3 text-sm font-inter text-gray-500 dark:text-gray-400">
              <li><a href="/" className="hover:text-accent transition-colors">{t('footer.home')}</a></li>
              <li><a href="/map" className="hover:text-accent transition-colors">{t('footer.map')}</a></li>
              <li><a href="/favorites" className="hover:text-accent transition-colors">{t('footer.favorites')}</a></li>
              <li><a href="/#trending" className="hover:text-accent transition-colors">{t('footer.trending')}</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-sora font-semibold text-lg mb-4 text-foreground">{t('footer.categories')}</h3>
            <ul className="space-y-3 text-sm font-inter text-gray-500 dark:text-gray-400">
              <li><Link href="/category/restaurant" className="hover:text-accent transition-colors">{t('footer.restaurants')}</Link></li>
              <li><Link href="/category/cafe" className="hover:text-accent transition-colors">{t('footer.cafes')}</Link></li>
              <li><Link href="/category/hotel" className="hover:text-accent transition-colors">{t('footer.hotels')}</Link></li>
              <li><Link href="/category/attraction" className="hover:text-accent transition-colors">{t('footer.attractions')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-sora font-semibold text-lg mb-4 text-foreground">{t('footer.legal')}</h3>
            <ul className="space-y-3 text-sm font-inter text-gray-500 dark:text-gray-400">
              <li><Link href="/legal/privacy" className="hover:text-accent transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link href="/legal/terms" className="hover:text-accent transition-colors">{t('footer.terms')}</Link></li>
              <li><Link href="/legal/cookies" className="hover:text-accent transition-colors">{t('footer.cookies')}</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-gray-100 dark:border-gray-900 text-center flex flex-col items-center justify-center">
          <p className="text-gray-400 text-sm font-inter">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
