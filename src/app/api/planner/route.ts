import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
    });
    
    const { interests, places } = await request.json();

    if (!interests || !places || places.length === 0) {
      return NextResponse.json({ error: 'Missing interests or places' }, { status: 400 });
    }

    const availablePlaces = places.map((p: any) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      rating: p.rating,
    }));

    const prompt = `You are a local guide planning a day trip.
User interests: ${interests.join(', ')}.
Available places: ${JSON.stringify(availablePlaces)}.

Generate a numbered day itinerary using ONLY the available places provided.
Respond strictly in JSON format matching this schema:
{
  "itinerary": [
    {
      "time": "e.g., 09:00 AM",
      "placeId": "id of the place",
      "placeName": "name of the place",
      "description": "Short reason why to visit."
    }
  ]
}
Return only valid JSON.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No content from OpenAI');

    const result = JSON.parse(content);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API /planner error:', error);
    return NextResponse.json({ error: 'Failed to generate itinerary' }, { status: 500 });
  }
}
