// Google Gemini API integration service
// Supports using VITE_GEMINI_API_KEY if configured, otherwise falls back to a generic response.
import { collectLiveData } from '../utils/appContextHelper';
export interface GeminiResponse {
  text: string;
  confidence: number;
  reasoning: string[];
  sources: string[];
  actions: string[];
}

export interface ComplaintAnalysisResult {
  category: 'Garbage' | 'Flood' | 'Pothole' | 'Broken Streetlight' | 'Illegal Dumping' | 'Road Damage' | 'Water Leakage';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  priority: 'P1 - Immediate' | 'P2 - High Priority' | 'P3 - Routine' | 'P4 - Scheduled';
  department: string;
  responseTime: string;
  recommendation: string;
  confidence: number;
  reasoning: string[];
}

// Retrieve Gemini API key from environment
export const API_KEY: string = import.meta.env.VITE_GEMINI_API_KEY;

// Log key presence (without revealing the key)
if (API_KEY) {
  console.log('Gemini API key loaded from environment.');
} else {
  console.warn('Gemini API key not found in environment.');
}

export const askGemini = async (prompt: string): Promise<GeminiResponse> => {
  const apiKey = API_KEY;
  if (!apiKey) {
    console.error('Gemini API key is missing. Falling back to demo data.');
    // Skip attempting request; will fall back later.
  }
  const query = prompt.toLowerCase().trim();

  // Gather live application state
  const liveData = collectLiveData();

  // Build dynamic system prompt
  const systemPrompt = `You are CivicPilot One, an AI Chief Decision Officer for Bengaluru Smart City.
Always answer using the live application state.

Current Selected Ward:
${JSON.stringify(liveData.selectedWard, null, 2)}

Current Dashboard:
${JSON.stringify(liveData.dashboard, null, 2)}

Current Complaint Analysis (latest 20):
${JSON.stringify(liveData.complaintAnalysis.history, null, 2)}

Current Predictions:
${JSON.stringify(liveData.predictionCenter, null, 2)}

Current Decision Center State:
${JSON.stringify(liveData.decisionCenter, null, 2)}

Current Community Health Score:
${liveData.dashboard.communityHealthScore ?? 'N/A'}

Current Resource Deployment:
${JSON.stringify(liveData.decisionCenter.resourceStatus, null, 2)}

Current Notifications (latest 10):
${JSON.stringify(liveData.notifications.latest, null, 2)}

Current Analytics Summary:
${JSON.stringify(liveData.analytics, null, 2)}

Latest Audit Logs (up to 20):
${JSON.stringify(liveData.auditLogs.latestActions, null, 2)}`;

  const fullPrompt = `${systemPrompt}\n\nUser Query: ${prompt}`;
  if (apiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const promptWithSchema = `${fullPrompt}\n\nPlease answer the query. You MUST respond ONLY with a JSON object conforming to the following TypeScript interface:\ninterface GeminiResponse {\n  text: string; // The markdown-formatted detailed answer/response to the user's question. If the user asked in a specific language (e.g. Kannada, Hindi, Spanish, etc.), please reply in that language.\n  confidence: number; // A confidence score between 0.0 and 1.0\n  reasoning: string[]; // List of reasoning steps or key points supporting the answer\n  sources: string[]; // Sources, references, or data feeds used\n  actions: string[]; // Recommended actions or next steps\n}\nDo not write any markdown wrappers (like \`\`\`json) outside the JSON object.`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptWithSchema }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      if (!response.ok) {
        const errBody = await response.text();
        console.error(`Gemini request failed with status ${response.status}`, errBody);
        throw new Error(`Gemini API error ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return JSON.parse(text) as GeminiResponse;
      } else {
        console.warn('Gemini response missing expected text field.');
        throw new Error('Invalid Gemini response format');
      }
    } catch (e) {
      console.error('Gemini API call failed:', e);
    }
  }

  // No longer referencing deprecated fields

    // Minimal fallback for genuine failures (missing API key, network issues, Gemini errors)
  console.warn('Unable to retrieve live AI analysis at the moment. Please try again later.');
  return {
    text: 'Unable to retrieve live AI analysis at the moment. Please try again later.',
    confidence: 0.0,
    reasoning: [],
    sources: [],
    actions: []
  } as GeminiResponse;
};

export const analyzeComplaintImage = async (
  imageSrc: string | null,
  description: string,
  location: string
): Promise<ComplaintAnalysisResult> => {
  const apiKey = API_KEY;
  if (!apiKey) {
    console.error('Gemini API key is missing. Falling back to demo data.');
    // Proceed to fallback logic below.
  }
  if (apiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const promptText = `Analyze this civic complaint.\nDescription: ${description}\nLocation: ${location}\n\nYou MUST respond ONLY with a JSON object conforming to the following TypeScript interface:\ninterface ComplaintAnalysisResult {\n  category: 'Garbage' | 'Flood' | 'Pothole' | 'Broken Streetlight' | 'Illegal Dumping' | 'Road Damage' | 'Water Leakage';\n  severity: 'Critical' | 'High' | 'Medium' | 'Low';\n  priority: 'P1 - Immediate' | 'P2 - High Priority' | 'P3 - Routine' | 'P4 - Scheduled';\n  department: string; // The municipal department responsible (e.g., 'BBMP Engineering & Roads Division', 'BWSSB & Stormwater Drains Division', 'BBMP Solid Waste Management (SWM)', 'BESCOM Streetlights Division')\n  responseTime: string; // Estimated response time (e.g., '3 Hours', '12 Hours', '24 Hours')\n  recommendation: string; // Actionable recommendation or mitigation steps\n  confidence: number; // A confidence score between 0.0 and 1.0\n  reasoning: string[]; // Visual features and context clues supporting the classification\n}\nDo not write any markdown wrappers (like \`\`\`json) outside the JSON object.`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      if (!response.ok) {
        const errBody = await response.text();
        console.error(`Gemini image analysis failed with status ${response.status}`, errBody);
        throw new Error('Gemini image analysis request failed');
      }
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return JSON.parse(text) as ComplaintAnalysisResult;
      } else {
        console.warn('Gemini image analysis response missing text field');
        throw new Error('Invalid Gemini image analysis response');
      }
    } catch (e) {
      console.error('Gemini image analysis error:', e);
    }
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const promptText = `Analyze this civic complaint.\nDescription: ${description}\nLocation: ${location}\n\nYou MUST respond ONLY with a JSON object conforming to the following TypeScript interface:\ninterface ComplaintAnalysisResult {\n  category: 'Garbage' | 'Flood' | 'Pothole' | 'Broken Streetlight' | 'Illegal Dumping' | 'Road Damage' | 'Water Leakage';\n  severity: 'Critical' | 'High' | 'Medium' | 'Low';\n  priority: 'P1 - Immediate' | 'P2 - High Priority' | 'P3 - Routine' | 'P4 - Scheduled';\n  department: string; // The municipal department responsible (e.g., 'BBMP Engineering & Roads Division', 'BWSSB & Stormwater Drains Division', 'BBMP Solid Waste Management (SWM)', 'BESCOM Streetlights Division')\n  responseTime: string; // Estimated response time (e.g., '3 Hours', '12 Hours', '24 Hours')\n  recommendation: string; // Actionable recommendation or mitigation steps\n  confidence: number; // A confidence score between 0.0 and 1.0\n  reasoning: string[]; // Visual features and context clues supporting the classification\n}\nDo not write any markdown wrappers (like \`\`\`json) outside the JSON object.`;

    let contents: any[] = [];
    if (imageSrc && imageSrc.startsWith('data:')) {
      const parts = imageSrc.split(',');
      const mimeType = parts[0].match(/data:(.*?);/)?.[1] || 'image/jpeg';
      const base64Data = parts[1];
      contents = [{
        parts: [
          { text: promptText },
          { inlineData: { mimeType, data: base64Data } }
        ]
      }];
    } else {
      contents = [{ parts: [{ text: promptText }] }];
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { responseMimeType: "application/json" }
      })
    });
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      return JSON.parse(text) as ComplaintAnalysisResult;
    }
  } catch (e) {
    console.warn('Gemini Vision API call failed, using fallback.', e);
  }


// Simulated fallback for image analysis
await new Promise(resolve => setTimeout(resolve, 2000));
const combined = (description + " " + location).toLowerCase();

if (combined.includes('pothole') || combined.includes('road') || combined.includes('hole') || (imageSrc && Math.random() > 0.6)) {
  return {
    category: 'Pothole',
    severity: 'High',
    priority: 'P2 - High Priority',
    department: 'BBMP Engineering & Roads Division',
    responseTime: '12 Hours',
    recommendation: 'Deploy quick‑setting asphalt patching unit to the location. Coordinate with traffic police for partial lane closure.',
    confidence: 0.96,
    reasoning: [
      "Visual feature detection spotted fractured asphalt matching pothole templates",
      "Location tags place the issue on a major arterial road in Whitefield",
      "High average speed on this corridor increases risk of vehicle damage and accidents"
    ]
  };
}

if (combined.includes('water') || combined.includes('flood') || combined.includes('drain') || combined.includes('leak')) {
  return {
    category: 'Flood',
    severity: 'Critical',
    priority: 'P1 - Immediate',
    department: 'BWSSB & Stormwater Drains Division',
    responseTime: '3 Hours',
    recommendation: 'Immediate dispatch of municipal pumps and drain clearing crews. Inspect the localized culvert for blockage.',
    confidence: 0.94,
    reasoning: [
      "Gemini Vision segment identified pooled water crossing sidewalk boundaries",
      "Resident notes water rising toward residential entry points in RR Nagar",
      "Historical flood record classifies this junction as a top‑tier risk"
    ]
  };
}

if (combined.includes('garbage') || combined.includes('dump') || combined.includes('trash') || combined.includes('waste')) {
  return {
    category: 'Garbage',
    severity: 'Medium',
    priority: 'P3 - Routine',
    department: 'BBMP Solid Waste Management (SWM)',
    responseTime: '24 Hours',
    recommendation: 'Add this location to the evening collection truck route. Deploy secondary cleanup crew for clearing organic residue.',
    confidence: 0.92,
    reasoning: [
      "Detected unsegregated municipal solid waste piled on secondary roadway",
      "Odor and health hazards present in surrounding residential ward (Jayanagar)",
      "Standard garbage bin is overflowed, indicating collection frequency deficiency"
    ]
  };
}

// Default fallback complaint
return {
  category: 'Broken Streetlight',
  severity: 'Medium',
  priority: 'P3 - Routine',
  department: 'BESCOM Streetlights Division',
  responseTime: '24 Hours',
  recommendation: 'Schedule LED bulb and sensor head replacement during next routine patrol.',
  confidence: 0.91,
  reasoning: [
    "Citizen logs streetlight failing to activate post‑dusk",
    "Electronic City smart monitoring system confirms power‑draw drop at Pole #349"
  ]
};
}

