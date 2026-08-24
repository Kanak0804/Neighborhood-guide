import fs from 'fs';

async function testWiki() {
  const areaName = 'Vijay Nagar, Indore';
  // Try taking just the first part for better wiki hits
  const searchName = areaName.split(',')[0].trim();
  
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchName)}`);
    const data = await res.json();
    console.log(data.extract);
  } catch(e) {
    console.error(e);
  }
}

testWiki();
