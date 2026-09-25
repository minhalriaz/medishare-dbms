import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from .env');
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash-lite',
    contents: 'Say hello to MediShare in one short sentence.',
  });

  console.log('GEMINI RESPONSE:');
  console.log(response.text);
}

main().catch((error) => {
  console.error('GEMINI TEST FAILED');
  console.error(error);
});
