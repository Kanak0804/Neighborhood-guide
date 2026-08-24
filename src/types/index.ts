export type CategoryType = 'restaurant' | 'cafe' | 'hotel' | 'park' | 'shopping' | 'attraction' | 'thingstodo';

export interface Place {
  id: string;
  name: string;
  rating: number;
  userRatingCount: number;
  address: string;
  photos: string[]; // URLs or reference strings
  openNow: boolean | null;
  priceLevel: number | null;
  types: string[];
  location: { lat: number; lng: number };
  category: CategoryType;
}

export interface DayPlannerInterest {
  id: string;
  label: string;
}

export interface ItineraryStep {
  time: string;
  placeId: string;
  placeName: string;
  description: string;
}
