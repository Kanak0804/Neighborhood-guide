import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name'); // e.g., places/PLACE_ID/photos/PHOTO_ID
  const maxHeight = searchParams.get('maxHeight') || '400';
  const maxWidth = searchParams.get('maxWidth') || '400';

  if (!name) {
    return new NextResponse('Missing photo name', { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const url = `https://places.googleapis.com/v1/${name}/media?key=${apiKey}&maxHeightPx=${maxHeight}&maxWidthPx=${maxWidth}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return new NextResponse('Failed to fetch photo', { status: response.status });
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

    return new NextResponse(arrayBuffer, { headers });
  } catch (error) {
    return new NextResponse('Error fetching photo', { status: 500 });
  }
}
