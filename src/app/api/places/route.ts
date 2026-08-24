import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { category, area } = await request.json();
    
    if (!category || !area) {
      return NextResponse.json({ error: 'Category and area are required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key is missing' }, { status: 500 });
    }

    const textQuery = `${category} in ${area}`;

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount,places.formattedAddress,places.photos,places.currentOpeningHours,places.priceLevel,places.primaryType,places.location',
      },
      body: JSON.stringify({
        textQuery,
        maxResultCount: 15,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Places API error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch places' }, { status: response.status });
    }

    const data = await response.json();
    
    const places = (data.places || []).map((place: any) => ({
      id: place.id,
      name: place.displayName?.text || 'Unknown',
      rating: place.rating || 0,
      userRatingCount: place.userRatingCount || 0,
      address: place.formattedAddress || '',
      photos: place.photos ? place.photos.map((p: any) => p.name) : [],
      openNow: place.currentOpeningHours?.openNow ?? null,
      priceLevel: place.priceLevel ? (place.priceLevel === 'PRICE_LEVEL_INEXPENSIVE' ? 1 : place.priceLevel === 'PRICE_LEVEL_MODERATE' ? 2 : place.priceLevel === 'PRICE_LEVEL_EXPENSIVE' ? 3 : place.priceLevel === 'PRICE_LEVEL_VERY_EXPENSIVE' ? 4 : null) : null,
      types: place.primaryType ? [place.primaryType] : [],
      location: {
        lat: place.location?.latitude,
        lng: place.location?.longitude,
      },
      category: category,
    }));

    return NextResponse.json({ places });
  } catch (error) {
    console.error('API /places error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
