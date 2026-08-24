import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { areaName } = await request.json();

    if (!areaName) {
      return NextResponse.json({ error: 'Missing areaName' }, { status: 400 });
    }

    // Get the first part of the area (e.g. "Bandra" from "Bandra, Mumbai") for better Wiki hits
    const searchName = areaName.split(',')[0].trim();
    
    // Use Wikipedia API for lightning-fast, free, and accurate location summaries
    const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchName)}`);
    
    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      if (wikiData.extract && !wikiData.extract.includes("may refer to")) {
        // Keep it punchy: max 3 sentences
        const sentences = wikiData.extract.split('. ').slice(0, 3).join('. ') + (wikiData.extract.split('. ').length > 3 ? '.' : '');
        return NextResponse.json({ summary: sentences });
      }
    }

    // Fallback if Wikipedia doesn't have an exact page for this neighborhood
    return NextResponse.json({ 
      summary: `${searchName} is a vibrant and bustling neighborhood with plenty to explore. From local cafes to unique attractions, it offers a wonderful experience for every visitor.` 
    });

  } catch (error) {
    console.error('API /summary error:', error);
    return NextResponse.json({ 
      summary: `A wonderful neighborhood to explore. Experience the best of local culture and places.`
    });
  }
}
