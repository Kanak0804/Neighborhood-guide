import OpenAI from 'openai';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/OPENAI_API_KEY=(.+)/);
const apiKey = match ? match[1].trim() : null;

const openai = new OpenAI({ apiKey });

async function test() {
  try {
    console.log('Testing OpenAI...');
    const start = Date.now();
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Say hi' }]
    });
    console.log('Success:', res.choices[0].message.content);
    console.log('Time:', Date.now() - start, 'ms');
  } catch (e) {
    console.error('Error:', e.message);
  }
}
test();
