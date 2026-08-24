import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Place } from '@/types';

interface FavoritesState {
  favorites: Place[];
  addFavorite: (place: Place) => void;
  removeFavorite: (placeId: string) => void;
  isFavorite: (placeId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (place) => set((state) => ({ favorites: [...state.favorites, place] })),
      removeFavorite: (placeId) => set((state) => ({
        favorites: state.favorites.filter((p) => p.id !== placeId)
      })),
      isFavorite: (placeId) => get().favorites.some((p) => p.id === placeId),
    }),
    {
      name: 'localite-favorites',
    }
  )
);
