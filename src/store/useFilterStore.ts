import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FilterState {
  minRating: number;
  maxPrice: number;
  openNowOnly: boolean;
  searchQuery: string;
  setMinRating: (rating: number) => void;
  setMaxPrice: (price: number) => void;
  setOpenNowOnly: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      minRating: 0,
      maxPrice: 4,
      openNowOnly: false,
      searchQuery: '',
      setMinRating: (rating) => set({ minRating: rating }),
      setMaxPrice: (price) => set({ maxPrice: price }),
      setOpenNowOnly: (open) => set({ openNowOnly: open }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      resetFilters: () => set({ minRating: 0, maxPrice: 4, openNowOnly: false, searchQuery: '' }),
    }),
    {
      name: 'filter-storage',
    }
  )
);
