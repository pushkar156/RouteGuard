import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Fallback logic if the key isn't provided so development can continue
const MOCK_EXTRACTION = {
  location: "Simulated Port",
  lat: 0.0,
  lng: 0.0,
  risk_type: "congestion",
  severity: 3,
  summary: "This is a mock extraction because the Gemini API key was missing.",
  estimated_duration_hours: 48,
  source_confidence: "medium"
};

// Helper for exponential backoff retries (Handles 429 Rate Limits)
const withRetry = async (fn, maxRetries = 3, initialDelay = 2000) => {
  let delay = initialDelay;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (err.status === 429 && i < maxRetries - 1) {
        console.warn(`🔄 Gemini Rate Limit (429). Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(r => setTimeout(r, delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      throw err;
    }
  }
};

// Zod schema for validating the AI response
export const riskEventSchema = z.object({
  relevant: z.boolean(),
  location: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  risk_type: z.enum(["weather", "port_strike", "political", "congestion", "piracy", "infrastructure", "customs", "environmental"]).optional(),
  severity: z.number().int().min(1).max(5).optional(),
  summary: z.string().optional(),
  estimated_duration_hours: z.number().optional(),
  source_confidence: z.enum(["high", "medium", "low"]).optional()
});

/**
 * Extracts structured risk data from a news article using Gemini.
 */
export const extractRiskFromArticle = async (article) => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_key_here') {
    console.log('⚠️ No GEMINI_API_KEY found. Returning mock extraction.');
    return { ...MOCK_EXTRACTION, summary: `Mocked from: ${article.title}` };
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  const prompt = `
    You are a supply chain risk analyst. Review the following news article.
    Is it relevant to logistics, shipping, or supply chain disruption?
    
    If it is NOT relevant, just return {"relevant": false}.
    
    If it IS relevant, extract the event into a JSON object. Ensure lat/lng are accurate for the specified location. Severity is 1 (minor) to 5 (catastrophic).
    
    Article Title: ${article.title}
    Article Description: ${article.description}
  `;

  try {
    const response = await withRetry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    relevant: { type: Type.BOOLEAN },
                    location: { type: Type.STRING },
                    lat: { type: Type.NUMBER },
                    lng: { type: Type.NUMBER },
                    risk_type: { type: Type.STRING, enum: ["weather", "port_strike", "political", "congestion", "piracy", "infrastructure", "customs", "environmental"] },
                    severity: { type: Type.INTEGER },
                    summary: { type: Type.STRING },
                    estimated_duration_hours: { type: Type.INTEGER },
                    source_confidence: { type: Type.STRING, enum: ["high", "medium", "low"] }
                },
                required: ["relevant"]
            }
        }
    }));

    const parsedResponse = JSON.parse(response.text);
    
    // Validate with Zod to ensure type safety
    const validated = riskEventSchema.parse(parsedResponse);
    return validated;
    
  } catch (error) {
    console.error(`Gemini Extraction Error for article '${article.title}':`, error);
    throw error;
  }
};

/**
 * Phase 4: Generates actionable rerouting suggestions based on a known disruption.
 */
export const generateReroutingSuggestions = async (shipment, event) => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_key_here') {
    return [
      {
        route_name: "Mocked Inland Diversion",
        estimated_delay_hours: 24,
        estimated_cost_increase_percent: 15,
        risk_reduction: 45,
        reasoning: "Diverts around the affected area using secondary rail networks. (Simulated AI response)",
        suggested_path: [[19.0, 72.8], [34.0, 69.0], [52.0, 4.0]] // Example path
      }
    ];
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  const prompt = `
    You are a maritime logistics advisor. A shipment named '${shipment.name}' traveling from '${shipment.origin}' to '${shipment.destination}' is blocked.
    
    The disruption is: ${event.type} (${event.severity}) at ${event.lat}, ${event.lng}.
    Context: ${event.title || ''} - ${event.desc || ''}
    
    Suggest 1-2 realistic alternative routing options or immediate actions. Respond ONLY in valid JSON array format.
  `;

  try {
    const response = await withRetry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        route_name: { type: Type.STRING },
                        estimated_delay_hours: { type: Type.INTEGER },
                        estimated_cost_increase_percent: { type: Type.INTEGER },
                        risk_reduction: { type: Type.INTEGER },
                        reasoning: { type: Type.STRING },
                        suggested_path: { 
                          type: Type.ARRAY, 
                          items: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                          description: "An array of [lat, lng] pairs representing the safest alternative path."
                        }
                    }
                }
            }
        }
    }));

    return JSON.parse(response.text);
  } catch (error) {
    console.error(`Gemini Rerouting Error for shipment '${shipment.id}':`, error);
    return []; // Fail gracefully 
  }
};
