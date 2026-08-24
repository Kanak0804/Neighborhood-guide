import fs from 'fs';
import path from 'path';

// Read .env.local
const envPath = path.join(process.cwd(), '.env.local');
const env = fs.readFileSync(envPath, 'utf8');
const match = env.match(/GOOGLE_PLACES_API_KEY=(.+)/);
const apiKey = match ? match[1].trim() : null;

if (!apiKey) {
  console.log('API key not found');
  process.exit(1);
}

async function test() {
  console.log('Testing Places API (New)...');
  const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.rating'
    },
    body: JSON.stringify({
      includedTypes: ['cafe'],
      maxResultCount: 2,
      locationRestriction: {
        circle: {
          center: { latitude: 22.7533, longitude: 75.8937 },
          radius: 3000,
        }
      }
    })
  });
  const data = await res.json();
  if (data.error) {
    console.error('API Error:', data.error);
  } else {
    console.log('API Success! Found', data.places?.length || 0, 'places');
  }
}

test();
